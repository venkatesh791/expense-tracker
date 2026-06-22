const Income = require('../models/Income');

// @desc    Get all incomes
// @route   GET /api/incomes
// @access  Private
const getIncomes = async (req, res) => {
  try {
    const { category, search, startDate, endDate, sort = '-date', page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Search by Description
    if (search) {
      query.description = { $regex: search, $options: 'i' };
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

    const incomes = await Income.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Income.countDocuments(query);

    res.json({
      incomes,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new income
// @route   POST /api/incomes
// @access  Private
const addIncome = async (req, res) => {
  const { amount, category, date, description } = req.body;

  try {
    if (!amount || !category || !date) {
      return res.status(400).json({ message: 'Amount, category and date are required' });
    }

    const income = new Income({
      userId: req.user._id,
      amount: Number(amount),
      category,
      date,
      description,
    });

    const createdIncome = await income.save();
    res.status(201).json(createdIncome);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update income
// @route   PUT /api/incomes/:id
// @access  Private
const updateIncome = async (req, res) => {
  const { amount, category, date, description } = req.body;

  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income entry not found' });
    }

    // Check user ownership
    if (income.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this entry' });
    }

    income.amount = amount !== undefined ? Number(amount) : income.amount;
    income.category = category || income.category;
    income.date = date || income.date;
    income.description = description !== undefined ? description : income.description;

    const updatedIncome = await income.save();
    res.json(updatedIncome);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete income
// @route   DELETE /api/incomes/:id
// @access  Private
const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income entry not found' });
    }

    // Check user ownership
    if (income.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this entry' });
    }

    await income.deleteOne();
    res.json({ message: 'Income entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
};
