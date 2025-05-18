const Expense = require('../model/expenseModel');
const User = require('../model/userModel');
const { Sequelize } = require('sequelize');

exports.getLeaderboard = async (req, res) => {
  const userId = req.userId;
  try {
    // Check if the user is premium
    const user = await User.findByPk(userId);
    if (!user || !user.isPremium) {
      return res.status(403).json({ message: 'Access denied: Not a premium user' });
    }

    // Aggregate total expenses by user
    const leaderboard = await User.findAll({
      attributes: ['id', 'fullname', 'email', 'totalexpense'],
      order: [['totalexpense', 'DESC']]
    });

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};
