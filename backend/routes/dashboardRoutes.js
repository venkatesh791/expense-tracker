const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getAnalytics,
  getAIInsights,
  getTransactions,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getDashboardSummary);
router.get('/analytics', protect, getAnalytics);
router.get('/insights', protect, getAIInsights);
router.get('/transactions', protect, getTransactions);

module.exports = router;
