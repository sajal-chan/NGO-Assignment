const express = require('express');
const auth = require('../middleware/auth');
const { getSummary } = require('../controllers/dashboardController');

const router = express.Router();

// GET /api/summary - Get dashboard summary
router.get('/summary', auth, getSummary);

module.exports = router;