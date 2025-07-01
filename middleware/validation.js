const { body } = require('express-validator');

// Transaction validation rules
const transactionValidation = [
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Description cannot exceed 100 characters'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Salary', 'Business', 'Investment', 'Freelance', 'Other Income',
      'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 
      'Healthcare', 'Education', 'Travel', 'Other Expense'
    ])
    .withMessage('Please select a valid category'),
  
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['Income', 'Expense'])
    .withMessage('Type must be either Income or Expense'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
];

// User registration validation
const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// User login validation
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = {
  transactionValidation,
  registerValidation,
  loginValidation
};