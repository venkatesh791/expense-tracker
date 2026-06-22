const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      // Can be a specific category (e.g. 'Food', 'Travel') or 'Total' for the overall monthly budget.
    },
    limit: {
      type: Number,
      required: [true, 'Please set a budget limit'],
      min: [0, 'Limit cannot be negative'],
    },
    month: {
      type: String,
      required: [true, 'Please specify the month (YYYY-MM)'],
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only have one budget limit per category per month
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;
