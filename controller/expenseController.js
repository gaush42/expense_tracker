const express = require('express')
const Expense = require('../model/expenseModel')
const User = require('../model/userModel')

exports.AddExpense = async (req, res) => {
    try{
        const { amount, description, catagory, userId } = req.body;
        const expense = await Expense.create({
            amount,
            description,
            catagory,
            UserId: userId
        })
        res.status(201).json({ message: 'Expense added!', expense });
    } catch (err){
        console.error(err);
        res.status(500).json({ message: 'Failed to add expense' });
    }
}
exports.GetExpenses = async (req, res) => {
    try {
      const expenses = await Expense.findAll({ where: { UserId: req.params.userId } });
      res.json(expenses);
    } catch (err) {
      res.status(500).json({ message: 'Could not fetch expenses' });
    }
}