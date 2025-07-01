const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');

const router = express.Router();

// Validation rules for transaction
const transactionValidation = [
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('description').trim().isLength({ min: 1, max: 200 }).withMessage('Description must be 1-200 characters'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').trim().isLength({ min: 1, max: 50 }).withMessage('Category must be 1-50 characters'),
  body('type').isIn(['Income', 'Expense']).withMessage('Type must be Income or Expense')
];

// All routes require authentication
router.use(auth);

// GET /api/transactions - Get all transactions with filtering
router.get('/', getAllTransactions);

// POST /api/transactions - Create new transaction
router.post('/', transactionValidation, createTransaction);

// PUT /api/transactions/:id - Update transaction
router.put('/:id', transactionValidation, updateTransaction);

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', deleteTransaction);

module.exports = router;