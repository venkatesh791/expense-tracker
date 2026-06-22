const express = require('express');
const router = express.Router();
const {
  getBudgets,
  setBudget,
  getBudgetSummary,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getBudgets)
  .post(protect, setBudget)
  .delete(protect, deleteBudget);

router.route('/summary')
  .get(protect, getBudgetSummary);

module.exports = router;
