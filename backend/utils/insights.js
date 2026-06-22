const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');

const generateInsights = async (userId) => {
  const insights = [];

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Previous month string
  let prevYear = now.getFullYear();
  let prevMonth = now.getMonth(); // Date's getMonth is 0-indexed (so current is 0-11, prev is -1 to 10)
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const prevMonthStart = new Date(prevYear, prevMonth - 1, 1);
  const prevMonthEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59);

  try {
    // 1. Get current month incomes and expenses
    const currentExpenses = await Expense.find({
      userId,
      date: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    const currentIncomes = await Income.find({
      userId,
      date: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    // 2. Get previous month incomes and expenses
    const prevExpenses = await Expense.find({
      userId,
      date: { $gte: prevMonthStart, $lte: prevMonthEnd },
    });

    const prevIncomes = await Income.find({
      userId,
      date: { $gte: prevMonthStart, $lte: prevMonthEnd },
    });

    // 3. Get budgets for current month
    const budgets = await Budget.find({
      userId,
      month: currentMonthStr,
    });

    // Aggregates
    const totalCurrentExpense = currentExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalCurrentIncome = currentIncomes.reduce((sum, item) => sum + item.amount, 0);
    const totalPrevExpense = prevExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalPrevIncome = prevIncomes.reduce((sum, item) => sum + item.amount, 0);

    // Insight 1: Highest spending category
    if (currentExpenses.length > 0) {
      const categoryTotals = {};
      currentExpenses.forEach((exp) => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      });

      let topCategory = '';
      let topAmount = 0;
      Object.keys(categoryTotals).forEach((cat) => {
        if (categoryTotals[cat] > topAmount) {
          topAmount = categoryTotals[cat];
          topCategory = cat;
        }
      });

      const percentageOfTotal = Math.round((topAmount / (totalCurrentExpense || 1)) * 100);
      insights.push({
        id: 'top_spending_category',
        type: 'info',
        title: 'Top Spending Category',
        message: `Your highest spending category this month is **${topCategory}** at **${percentageOfTotal}%** of your total budget. You've spent a total of **${topAmount}** on this category.`,
      });

      // Discretionary spending check
      const discretionaryCategories = ['Shopping', 'Entertainment', 'Food'];
      const discretionaryTotal = currentExpenses
        .filter((e) => discretionaryCategories.includes(e.category))
        .reduce((sum, e) => sum + e.amount, 0);

      if (discretionaryTotal > 0 && totalCurrentExpense > 0) {
        const discRatio = discretionaryTotal / totalCurrentExpense;
        if (discRatio > 0.45) {
          const savingsPotential = Math.round(discretionaryTotal * 0.15);
          insights.push({
            id: 'discretionary_spending',
            type: 'warning',
            title: 'Discretionary Spending Alert',
            message: `Discretionary items (Shopping, Entertainment, Food) account for **${Math.round(discRatio * 100)}%** of your total expenses. You can save approximately **${savingsPotential}** by reducing this spending by 15%.`,
          });
        }
      }
    }

    // Insight 2: Savings Rate Comparison
    if (totalCurrentIncome > 0) {
      const currentSavingsRate = ((totalCurrentIncome - totalCurrentExpense) / totalCurrentIncome) * 100;
      
      if (totalPrevIncome > 0) {
        const prevSavingsRate = ((totalPrevIncome - totalPrevExpense) / totalPrevIncome) * 100;
        const rateDiff = currentSavingsRate - prevSavingsRate;
        
        if (rateDiff > 2) {
          insights.push({
            id: 'savings_rate_improved',
            type: 'success',
            title: 'Savings Rate Boost',
            message: `Your savings rate improved by **${Math.round(rateDiff)}%** compared to last month! You are saving a higher share of your earnings.`,
          });
        } else if (rateDiff < -2) {
          insights.push({
            id: 'savings_rate_declined',
            type: 'danger',
            title: 'Savings Rate Warning',
            message: `Your savings rate declined by **${Math.round(Math.abs(rateDiff))}%** compared to last month. Review your recent transactions to locate leakages.`,
          });
        }
      } else {
        insights.push({
          id: 'savings_rate_initial',
          type: 'success',
          title: 'Current Savings Rate',
          message: `Your savings rate is currently **${Math.round(currentSavingsRate)}%** this month. Great start to tracking your finance!`,
        });
      }
    }

    // Insight 3: Category Budget Limits Warning
    if (budgets.length > 0 && currentExpenses.length > 0) {
      const categoryTotals = {};
      currentExpenses.forEach((exp) => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      });

      budgets.forEach((b) => {
        const spent = categoryTotals[b.category] || 0;
        const limit = b.limit;
        
        if (limit > 0) {
          const ratio = spent / limit;
          if (ratio >= 1.0) {
            insights.push({
              id: `budget_exceeded_${b.category}`,
              type: 'danger',
              title: `Budget Exceeded - ${b.category}`,
              message: `You've exceeded your **${b.category}** budget by **${spent - limit}**. Avoid further spending here.`,
            });
          } else if (ratio >= 0.8) {
            insights.push({
              id: `budget_alert_${b.category}`,
              type: 'warning',
              title: `Budget Alert - ${b.category}`,
              message: `You have utilized **${Math.round(ratio * 100)}%** of your **${b.category}** budget. You only have **${limit - spent}** remaining.`,
            });
          }
        }
      });
    }

    // Fallback if no insights generated (e.g. empty database)
    if (insights.length === 0) {
      insights.push({
        id: 'no_data_insight',
        type: 'info',
        title: 'Start Tracking Incomes & Expenses',
        message: 'No insights available yet. Please add a few income and expense transactions to trigger smart financial recommendations.',
      });
    }

    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [
      {
        id: 'insight_error',
        type: 'info',
        title: 'Insights Engine',
        message: 'Add more transactions and establish budgets to see smart AI insights.',
      },
    ];
  }
};

module.exports = { generateInsights };
