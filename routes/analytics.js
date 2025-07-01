const express = require('express');
const auth = require('../middleware/auth');
const { getCategorySummary } = require('../controllers/analyticsController');

const router = express.Router();

// GET /api/analytics/category-summary - Get spending by category
router.get('/category-summary', auth, getCategorySummary);

module.exports = router;