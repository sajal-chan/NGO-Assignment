const Transaction = require('../models/Transaction');

const getCategorySummary = async (req, res) => {
  try {
    const { month, year, type = 'Expense' } = req.query;
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

    // Aggregate by category
    const categoryData = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: type,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    // Calculate percentages
    const totalAmount = categoryData.reduce((sum, item) => sum + item.total, 0);
    
    const categoriesWithPercentage = categoryData.map(item => ({
      ...item,
      percentage: totalAmount > 0 ? Math.round((item.total / totalAmount) * 100) : 0
    }));

    res.json({
      categories: categoriesWithPercentage,
      totalAmount,
      type,
      period: month && year ? `${month}/${year}` : year || 'All time'
    });
  } catch (error) {
    console.error('Category summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCategorySummary };
