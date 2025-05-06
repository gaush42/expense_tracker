const Expense = require('../model/expenseModel')
const User = require('../model/userModel')
const sequelize = require('../config/dbConfig')

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
    }, {transaction: t})
    await t.commit();
    res.status(201).json({ message: 'Expense added!', expense });
  } catch (err){
    await t.rollback()
    console.error(err);
    res.status(500).json({ message: 'Failed to add expense' });
  }
}
exports.GetExpenses = async (req, res) => {
  /*const userId = req.userId;
  try {
    const expenses = await Expense.findAll({ where: { userId } });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }*/
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Expense.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);
    res.json({ expenses: rows, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
}
exports.GetAllExpense = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findByPk(userId);
    if (!user || !user.isPremium) {
    return res.status(403).json({ message: 'Access denied: Not a premium user' });
    }
    const expenses = await Expense.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
    });
    res.json(expenses);
    } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
}
exports.deleteExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.userId;
    const expenseId = req.params.id;

    const expense = await Expense.findOne({ where: { id: expenseId, userId } });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }
    await expense.destroy();
    await t.commit()
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Server error' });
  }
}
  