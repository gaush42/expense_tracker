const Expense = require('../model/expenseModel')
const User = require('../model/userModel')
const sequelize = require('../config/dbConfig')
const AWS = require('aws-sdk')
const convertToPdf = require('../utils/convertTopdf')
require("dotenv").config();

exports.AddExpense = async (req, res) => {
  // Start a new transaction to ensure atomicity
  const t = await sequelize.transaction();
  try{
    // Destructure required fields from the request body
    const { amount, description, category } = req.body;
    // Get the authenticated user's ID (set by auth middleware)
    const userId = req.userId;
    // Create a new expense record associated with the user within the transaction
    const expense = await Expense.create({
        amount,
        description,
        category,
        UserId: userId
    }, {transaction: t})
    // 2. Update the user's totalexpense within the same transaction
    const user = await User.findByPk(userId, { transaction: t });
    user.totalexpense += parseFloat(amount);
    await user.save({ transaction: t });
    // Commit the transaction after successful creation
    await t.commit();
    // Respond with success and the newly created expense object
    res.status(201).json({ message: 'Expense added!', expense });
  } catch (err){
    // Roll back the transaction in case of any errors
    await t.rollback()
    console.error(err);
    res.status(500).json({ message: 'Failed to add expense' });
  }
}
exports.GetExpenses = async (req, res) => {

  const userId = req.userId;
  // Parse pagination parameters from query string, set default values if not provided
  const page = parseInt(req.query.page) || 1; // default page is 5
  const limit = parseInt(req.query.limit) || 10;  // default number of expenses per page is 10
  // calculate offset based on page and limit
  // How many records to skip before starting to fetch the current page data
  const offset = (page - 1) * limit; 
  try {
    // Fetch expenses with count and rows using pagination, filtering by userId
    const { count, rows } = await Expense.findAndCountAll({
      where: { userId },
      limit,  // limit the number of records
      offset, // skip records based on page number
      order: [['createdAt', 'DESC']] // sort by creation date, newest first
    });
    // Calculate the total number of pages
    const totalPages = Math.ceil(count / limit);
    res.json({ expenses: rows, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
}

exports.deleteExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.userId;
    // Get the expense ID from the request parameters
    const expenseId = req.params.id;
    // Find the expense belonging to the user with the given ID
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

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

exports.downloadReport = async (req, res) => {
  const userId = req.userId;

  try {
    // Fetch user details to check if they are a premium user
    const user = await User.findByPk(userId);
    // Block access if the user is not premium
    if (!user || !user.isPremium) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Retrieve all expenses for the user, ordered by creation time (oldest first)
    const expenses = await Expense.findAll({ where: { userId }, order: [['createdAt', 'ASC']] });
    // Generate a PDF buffer from the expenses list 
    const pdfBuffer = Buffer.from(convertToPdf(expenses));
    const fileName = `Expense_Report_${userId}_${Date.now()}.pdf`;

    const s3Params = {
      Bucket: process.env.S3_BUCKET,
      Key: `reports/${fileName}`, // File path and name in the bucket
      Body: pdfBuffer,  // Actual PDF data
      ContentType: 'application/pdf', // MIME type
      ACL: 'public-read'  // Makes the file publicly accessible
    };
    // Upload the file to S3 and wait for completion
    const s3Upload = await s3.upload(s3Params).promise();

    // Respond with S3 URL
    res.json({ fileUrl: s3Upload.Location });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating or uploading PDF' });
  }
};

  