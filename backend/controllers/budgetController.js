const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Get all budgets for a given month
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  const { month } = req.query; // YYYY-MM
  
  if (!month) {
    return res.status(400).json({ message: 'Month parameter (YYYY-MM) is required' });
  }

  try {
    const budgets = await Budget.find({ userId: req.user._id, month });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set/Update budget limit for a category and month
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res) => {
  const { category, limit, month } = req.body;

  if (!category || limit === undefined || !month) {
    return res.status(400).json({ message: 'Category, limit and month are required' });
  }

  try {
    // Upsert budget
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category, month },
      { limit: Number(limit) },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get budget vs spending summary
// @route   GET /api/budgets/summary
// @access  Private
const getBudgetSummary = async (req, res) => {
  const { month } = req.query; // YYYY-MM

  if (!month) {
    return res.status(400).json({ message: 'Month parameter (YYYY-MM) is required' });
  }

  try {
    // Parse start and end of month
    const [year, m] = month.split('-');
    const startOfMonth = new Date(Number(year), Number(m) - 1, 1);
    const endOfMonth = new Date(Number(year), Number(m), 0, 23, 59, 59);

    // 1. Get budgets for this month
    const budgets = await Budget.find({ userId: req.user._id, month });

    // 2. Aggregate expenses by category for this month
    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const categorySpend = {};
    let totalSpent = 0;

    expenses.forEach((e) => {
      categorySpend[e.category] = (categorySpend[e.category] || 0) + e.amount;
      totalSpent += e.amount;
    });

    // 3. Construct summary list
    const summary = budgets.map((b) => {
      const spent = categorySpend[b.category] || 0;
      const percentUsed = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      return {
        category: b.category,
        limit: b.limit,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round((b.limit - spent) * 100) / 100,
        percentUsed: Math.round(percentUsed * 100) / 100,
      };
    });

    // If 'Total' budget is set, check it, else construct dummy Total summary
    const totalBudgetObj = budgets.find(b => b.category === 'Total');
    const totalLimit = totalBudgetObj ? totalBudgetObj.limit : 0;
    const totalPercentUsed = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

    res.json({
      summary,
      totalLimit,
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalPercentUsed: Math.round(totalPercentUsed * 100) / 100,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete budget limit for a category and month
// @route   DELETE /api/budgets
// @access  Private
const deleteBudget = async (req, res) => {
  const { category, month } = req.body;

  if (!category || !month) {
    return res.status(400).json({ message: 'Category and month are required' });
  }

  try {
    const budget = await Budget.findOneAndDelete({ userId: req.user._id, category, month });
    if (!budget) {
      return res.status(404).json({ message: 'Budget entry not found' });
    }
    res.json({ message: 'Budget entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBudgets,
  setBudget,
  getBudgetSummary,
  deleteBudget,
};
