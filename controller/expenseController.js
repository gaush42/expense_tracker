const express = require('express')
const Expense = require('../model/expenseModel')
const User = require('../model/userModel')

exports.AddExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try{
        const { amount, description, category } = req.body;
        const userId = req.userId;
        const expense = await Expense.create({
            amount,
            description,
            category,
            UserId: userId
        }, { transaction: t })
        await t.commit();
        res.status(201).json({ message: 'Expense added!', expense });
    } catch (err){
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Failed to add expense' });
    }
}
exports.GetExpenses = async (req, res) => {
    const userId = req.userId;

    try {
        const expenses = await Expense.findAll({ where: { userId } });
        res.json(expenses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch expenses' });
    }
}
exports.deleteExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const userId = req.userId;
      const expenseId = req.params.id;
  
      const expense = await Expense.findOne({ where: { id: expenseId, userId }, transaction:t });
      if (!expense) {
        await t.rollback();
        return res.status(404).json({ message: 'Expense not found or unauthorized' });
      }
  
      await expense.destroy();
      await t.commit();
      res.json({ message: 'Expense deleted successfully' });
    } catch (err) {
        await t.rollback();
      res.status(500).json({ message: 'Server error' });
    }
}
exports.getLeaderboard = async (req, res) => {
    try {
      const leaderboardUsers = await User.findAll({
        attributes: ['id', 'name', 'email',
          [sequelize.fn('SUM', sequelize.col('expenses.amount')), 'totalExpenses']
        ],
        include: [{ model: Expense, attributes: [] }],
        group: ['User.id'],
        order: [[sequelize.literal('totalExpenses'), 'DESC']]
      });
  
      res.json(leaderboardUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to load leaderboard" });
    }
};
  