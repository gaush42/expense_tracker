const {DataTypes} = require('sequelize')
const sequelize = require('../config/dbConfig')
const User = require('../model/userModel')

const Expense = sequelize.define('Expenses', {
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  
  User.hasMany(Expense);
  Expense.belongsTo(User);
  
  module.exports = Expense;