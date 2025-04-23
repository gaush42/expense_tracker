const express = require('express')
const Expense = require('../model/expenseModel')
const User = require('../model/userModel')

exports.AddExpense = async (req, res) => {
    try{
        const { amount, description, category } = req.body;
        const userId = req.userId;
        const expense = await Expense.create({
            amount,
            description,
            category,
            UserId: userId
        })
        res.status(201).json({ message: 'Expense added!', expense });
    } catch (err){
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
    try {
      const userId = req.userId;
      const expenseId = req.params.id;
  
      const expense = await Expense.findOne({ where: { id: expenseId, userId } });
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found or unauthorized' });
      }
  
      await expense.destroy();
      res.json({ message: 'Expense deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
}
  