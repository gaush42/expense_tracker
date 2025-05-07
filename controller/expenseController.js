const Expense = require('../model/expenseModel')
const User = require('../model/userModel')
const sequelize = require('../config/dbConfig')
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const uploadToS3 = require('./uploadToS3');
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const convertToPdf = require('../utils/convertTopdf')
require("dotenv").config();

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
/*exports.downloadReport = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findByPk(userId);
    if (!user || !user.isPremium) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const expenses = await Expense.findAll({ where: { userId }, order: [['createdAt', 'ASC']] });

    const doc = new jsPDF();
    let y = 20;

    // ... your PDF formatting logic here ...

    // Instead of saving locally, get as buffer:
    const pdfBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfBuffer);

    const fileUrl = await uploadToS3(buffer, 'Expense_Report.pdf');
    res.json({ fileUrl });

  } catch (err) {
    console.error('Error generating/uploading PDF:', err);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};*/
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

exports.downloadReport = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findByPk(userId);
    if (!user || !user.isPremium) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const expenses = await Expense.findAll({ where: { userId }, order: [['createdAt', 'ASC']] });

    const fileName = `Expense_Report_${userId}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '..', 'temp', fileName);

    // Generate the PDF file
    convertToPdf(expenses, filePath);

    // Read the PDF and upload to S3
    const fileContent = fs.readFileSync(filePath);

    const s3Params = {
      Bucket: process.env.S3_BUCKET,
      Key: `reports/${fileName}`,
      Body: fileContent,
      ContentType: 'application/pdf',
      ACL: 'public-read'
    };

    const s3Upload = await s3.upload(s3Params).promise();

    // Delete local file after upload
    fs.unlinkSync(filePath);

    // Respond with S3 URL
    res.json({ fileUrl: s3Upload.Location });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating or uploading PDF' });
  }
};

  