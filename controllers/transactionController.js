const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

// Get all transactions with filtering
const getAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate, category, description, page = 1, limit = 50 } = req.query;
    
    // Build filter object
    const filter = { userId: req.user._id };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    
    if (description) {
      filter.description = { $regex: description, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get transactions with pagination
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Transaction.countDocuments(filter);
    
    res.json({
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTransactions: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new transaction
const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, description, amount, category, type } = req.body;
    
    const transaction = new Transaction({
      userId: req.user._id,
      date: new Date(date),
      description: description.trim(),
      amount: parseFloat(amount),
      category: category.trim(),
      type
    });

    await transaction.save();
    
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { date, description, amount, category, type } = req.body;
    
    const transaction = await Transaction.findOne({ 
      _id: id, 
      userId: req.user._id 
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update fields
    transaction.date = new Date(date);
    transaction.description = description.trim();
    transaction.amount = parseFloat(amount);
    transaction.category = category.trim();
    transaction.type = type;
    transaction.updatedAt = new Date();

    await transaction.save();
    
    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findOneAndDelete({ 
      _id: id, 
      userId: req.user._id 
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
