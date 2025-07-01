const Transaction = require('../models/Transaction');

const getSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user._id;
    
    // Build date filter
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
    }

    // Aggregate income and expenses
    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Process results
    let totalIncome = 0;
    let totalExpense = 0;
    
    summary.forEach(item => {
      if (item._id === 'Income') {
        totalIncome = item.total;
      } else if (item._id === 'Expense') {
        totalExpense = item.total;
      }
    });

    const balance = totalIncome - totalExpense;

    // Get recent transactions (last 5)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('date description amount category type');

    res.json({
      balance,
      totalIncome,
      totalExpense,
      recentTransactions,
      period: month && year ? `${month}/${year}` : year || 'All time'
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSummary };