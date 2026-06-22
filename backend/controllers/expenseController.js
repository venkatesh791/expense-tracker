const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');

// Helper to check and trigger budget notifications
const checkBudgetAlerts = async (userId, category, date, amountInserted) => {
  try {
    const expenseDate = new Date(date);
    const monthStr = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;

    // Get month range
    const startOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1);
    const endOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 0, 23, 59, 59);

    // 1. Get budget for this category
    const catBudget = await Budget.findOne({ userId, category, month: monthStr });
    
    // 2. Get overall total monthly budget
    const totalBudget = await Budget.findOne({ userId, category: 'Total', month: monthStr });

    // 3. Calculate sum spent in this category this month
    const categoryExpenses = await Expense.find({
      userId,
      category,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const totalCatSpent = categoryExpenses.reduce((sum, item) => sum + item.amount, 0);

    // 4. Calculate total spent overall this month
    const allExpenses = await Expense.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const totalMonthlySpent = allExpenses.reduce((sum, item) => sum + item.amount, 0);

    // Check category budget thresholds
    if (catBudget && catBudget.limit > 0) {
      const percentage = (totalCatSpent / catBudget.limit) * 100;
      
      if (percentage >= 100) {
        // Create 100% exceeded alert
        await Notification.create({
          userId,
          type: 'danger',
          message: `Budget Exceeded! You have spent ${totalCatSpent} out of your ${catBudget.limit} limit for ${category} in ${monthStr}.`,
        });
      } else if (percentage >= 80) {
        // Create 80% alert
        // First check if an 80% warning has already been created to avoid duplicates
        const existingWarning = await Notification.findOne({
          userId,
          message: { $regex: `^(?=.*utilized 80%)(?=.*${category})(?=.*${monthStr})`, $options: 'i' }
        });
        if (!existingWarning) {
          await Notification.create({
            userId,
            type: 'warning',
            message: `Budget Alert! You have utilized ${Math.round(percentage)}% of your ${category} budget for ${monthStr}. Spent: ${totalCatSpent}/${catBudget.limit}.`,
          });
        }
      }
    }

    // Check overall total monthly budget thresholds
    if (totalBudget && totalBudget.limit > 0) {
      const percentage = (totalMonthlySpent / totalBudget.limit) * 100;

      if (percentage >= 100) {
        await Notification.create({
          userId,
          type: 'danger',
          message: `Monthly Budget Exhausted! Total expenses (${totalMonthlySpent}) have exceeded your overall monthly limit of ${totalBudget.limit} for ${monthStr}.`,
        });
      } else if (percentage >= 80) {
        const existingWarning = await Notification.findOne({
          userId,
          message: { $regex: `^(?=.*utilized 80%)(?=.*Monthly Budget)(?=.*${monthStr})`, $options: 'i' }
        });
        if (!existingWarning) {
          await Notification.create({
            userId,
            type: 'warning',
            message: `Monthly Budget Alert! You have utilized ${Math.round(percentage)}% of your overall budget limit of ${totalBudget.limit} for ${monthStr}.`,
          });
        }
      }
    }

    // 5. Detect unusual spending (transaction amount is > 2.5x the average transaction amount of this category for the user)
    const allUserCatExpenses = await Expense.find({ userId, category });
    if (allUserCatExpenses.length >= 3) {
      // Calculate avg of previous expenses in this category (excluding the newly added one)
      const prevCatExpenses = allUserCatExpenses.filter(e => e.amount !== amountInserted);
      if (prevCatExpenses.length > 0) {
        const totalPrevAmt = prevCatExpenses.reduce((sum, item) => sum + item.amount, 0);
        const avgAmt = totalPrevAmt / prevCatExpenses.length;
        
        if (amountInserted > avgAmt * 2.5) {
          await Notification.create({
            userId,
            type: 'warning',
            message: `Unusual Spending Detected! You logged an expense of ${amountInserted} in ${category}, which is significantly higher than your average spend of ${Math.round(avgAmt)} in this category.`,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in checkBudgetAlerts:', error);
  }
};

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { category, search, paymentMethod, startDate, endDate, sort = '-date', page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Filter by Payment Method
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Search by Notes
    if (search) {
      query.notes = { $regex: search, $options: 'i' };
    }

    // Filter by Date Range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const expenses = await Expense.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
  const { amount, category, date, paymentMethod, notes } = req.body;

  try {
    if (!amount || !category || !date) {
      return res.status(400).json({ message: 'Amount, category and date are required' });
    }

    const expense = new Expense({
      userId: req.user._id,
      amount: Number(amount),
      category,
      date,
      paymentMethod,
      notes,
    });

    const createdExpense = await expense.save();
    
    // Fire budget alert trigger asynchronously
    checkBudgetAlerts(req.user._id, category, date, Number(amount));

    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  const { amount, category, date, paymentMethod, notes } = req.body;

  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense entry not found' });
    }

    // Check user ownership
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this entry' });
    }

    expense.amount = amount !== undefined ? Number(amount) : expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.paymentMethod = paymentMethod || expense.paymentMethod;
    expense.notes = notes !== undefined ? notes : expense.notes;

    const updatedExpense = await expense.save();

    // Check alerts again
    checkBudgetAlerts(req.user._id, expense.category, expense.date, Number(expense.amount));

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense entry not found' });
    }

    // Check user ownership
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this entry' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
};
