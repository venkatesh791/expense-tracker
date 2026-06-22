const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const { generateInsights } = require('../utils/insights');

// Helper to get start and end dates for a range
const getDateRanges = () => {
  const now = new Date();
  
  // Current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return {
    currentMonthStart,
    currentMonthEnd,
  };
};

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const { currentMonthStart, currentMonthEnd } = getDateRanges();
    const userId = req.user._id;

    // 1. Current month expenses
    const expenses = await Expense.find({
      userId,
      date: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 2. Current month incomes
    const incomes = await Income.find({
      userId,
      date: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    // 3. Overall Balance (All time balance)
    const allExpenses = await Expense.find({ userId });
    const allIncomes = await Income.find({ userId });
    const totalAllTimeExpense = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalAllTimeIncome = allIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalBalance = totalAllTimeIncome - totalAllTimeExpense;

    // 4. Monthly Savings
    const monthlySavings = totalIncome - totalExpenses;

    // 5. Budget Utilization for Current Month
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const totalBudget = await Budget.findOne({ userId, category: 'Total', month: currentMonthStr });
    
    let budgetLimit = 0;
    let budgetUtilization = 0;

    if (totalBudget) {
      budgetLimit = totalBudget.limit;
      budgetUtilization = budgetLimit > 0 ? (totalExpenses / budgetLimit) * 100 : 0;
    }

    // 6. Recent combined transactions (last 5)
    // Map income & expense items to common format
    const formattedIncomes = incomes.map(item => ({
      _id: item._id,
      amount: item.amount,
      category: item.category,
      date: item.date,
      description: item.description,
      type: 'income',
    }));

    const formattedExpenses = expenses.map(item => ({
      _id: item._id,
      amount: item.amount,
      category: item.category,
      date: item.date,
      description: item.notes,
      type: 'expense',
    }));

    const recentTransactions = [...formattedIncomes, ...formattedExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({
      totalBalance: Math.round(totalBalance * 100) / 100,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      budgetLimit: Math.round(budgetLimit * 100) / 100,
      budgetUtilization: Math.round(budgetUtilization * 100) / 100,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics chart data
// @route   GET /api/dashboard/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  const { range = 'monthly' } = req.query; // weekly, monthly, quarterly, yearly
  const userId = req.user._id;

  try {
    const now = new Date();
    let startDate;

    if (range === 'weekly') {
      // Last 7 days
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === 'monthly') {
      // Last 30 days
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === 'quarterly') {
      // Last 90 days
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else {
      // Yearly: Last 365 days
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const expenses = await Expense.find({ userId, date: { $gte: startDate } }).sort('date');
    const incomes = await Income.find({ userId, date: { $gte: startDate } }).sort('date');

    // 1. Category-wise Expense breakdown
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const categoryData = Object.keys(categoryTotals).map((cat) => ({
      name: cat,
      value: Math.round(categoryTotals[cat] * 100) / 100,
    }));

    // 2. Monthly Expense and Income Trend (Grouped by month for charting)
    // Retrieve past 6 months of data specifically for a smooth monthly chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const trendExpenses = await Expense.find({ userId, date: { $gte: sixMonthsAgo } });
    const trendIncomes = await Income.find({ userId, date: { $gte: sixMonthsAgo } });

    const months = [];
    const tempDate = new Date(sixMonthsAgo);
    for (let i = 0; i < 6; i++) {
      months.push({
        label: tempDate.toLocaleString('default', { month: 'short' }) + ' ' + tempDate.getFullYear(),
        monthNum: tempDate.getMonth(),
        yearNum: tempDate.getFullYear(),
        income: 0,
        expense: 0,
        savings: 0,
      });
      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    trendExpenses.forEach((e) => {
      const expDate = new Date(e.date);
      const match = months.find(m => m.monthNum === expDate.getMonth() && m.yearNum === expDate.getFullYear());
      if (match) {
        match.expense += e.amount;
      }
    });

    trendIncomes.forEach((i) => {
      const incDate = new Date(i.date);
      const match = months.find(m => m.monthNum === incDate.getMonth() && m.yearNum === incDate.getFullYear());
      if (match) {
        match.income += i.amount;
      }
    });

    // Round stats and calculate savings
    months.forEach((m) => {
      m.income = Math.round(m.income * 100) / 100;
      m.expense = Math.round(m.expense * 100) / 100;
      m.savings = Math.round((m.income - m.expense) * 100) / 100;
    });

    // 3. Top Spending Categories List
    const topCategories = Object.keys(categoryTotals)
      .map((cat) => ({
        category: cat,
        amount: Math.round(categoryTotals[cat] * 100) / 100,
      }))
      .sort((a, b) => b.amount - a.amount);

    res.json({
      categoryData,
      monthlyTrend: months,
      topCategories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get smart insights
// @route   GET /api/dashboard/insights
// @access  Private
const getAIInsights = async (req, res) => {
  try {
    const insights = await generateInsights(req.user._id);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get combined, paginated, and sorted transaction ledger
// @route   GET /api/dashboard/transactions
// @access  Private
const getTransactions = async (req, res) => {
  const { search, type, category, startDate, endDate, sort = '-date', page = 1, limit = 10 } = req.query;
  const userId = req.user._id;

  try {
    // 1. Build Incomes Filter
    const incomeFilter = { userId };
    if (category) incomeFilter.category = category;
    if (search) incomeFilter.description = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      incomeFilter.date = {};
      if (startDate) incomeFilter.date.$gte = new Date(startDate);
      if (endDate) incomeFilter.date.$lte = new Date(endDate);
    }

    // 2. Build Expenses Filter
    const expenseFilter = { userId };
    if (category) expenseFilter.category = category;
    if (search) expenseFilter.notes = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      expenseFilter.date = {};
      if (startDate) expenseFilter.date.$gte = new Date(startDate);
      if (endDate) expenseFilter.date.$lte = new Date(endDate);
    }

    // 3. Query Incomes & Expenses
    let incomes = [];
    let expenses = [];

    if (!type || type === 'income') {
      incomes = await Income.find(incomeFilter);
    }
    if (!type || type === 'expense') {
      expenses = await Expense.find(expenseFilter);
    }

    // 4. Format & Merge
    const formattedIncomes = incomes.map(item => ({
      _id: item._id,
      amount: item.amount,
      category: item.category,
      date: item.date,
      description: item.description,
      type: 'income',
    }));

    const formattedExpenses = expenses.map(item => ({
      _id: item._id,
      amount: item.amount,
      category: item.category,
      date: item.date,
      description: item.notes,
      type: 'expense',
    }));

    let merged = [...formattedIncomes, ...formattedExpenses];

    // 5. Sort
    const isDesc = sort.startsWith('-');
    const sortField = isDesc ? sort.substring(1) : sort;

    merged.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });

    // 6. Paginate
    const total = merged.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = Number(page) * Number(limit);
    const paginated = merged.slice(startIndex, endIndex);

    res.json({
      transactions: paginated,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardSummary,
  getAnalytics,
  getAIInsights,
  getTransactions,
};
