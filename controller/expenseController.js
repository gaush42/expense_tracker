const Expense = require('../model/expenseModel')
const User = require('../model/userModel')
const sequelize = require('../config/dbConfig')
const AWS = require('aws-sdk')
const convertToPdf = require('../utils/convertTopdf')
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
require("dotenv").config();

exports.AddExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    const userId = req.userId;

    // Create new expense document
    const expense = new Expense({
      amount,
      description,
      category,
      user: userId // assuming 'user' is the ref field in Expense schema
    });
    await expense.save();

    // Update the user's total expense
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.totalexpense += parseFloat(amount);
    await user.save();

    res.status(201).json({ message: 'Expense added!', expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add expense' });
  }
};

exports.GetExpenses = async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Get total count of user's expenses
    const count = await Expense.countDocuments({ user: userId });

    // Fetch paginated expenses
    const expenses = await Expense.find({ user: userId })
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(count / limit);

    res.json({ expenses, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
};

exports.deleteExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.userId;
    const expenseId = req.params.id;

    // Find the expense document by ID and user
    const expense = await Expense.findOne({ _id: expenseId, user: userId }).session(session);

    if (!expense) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    // Find the user and update totalexpense
    const user = await User.findById(userId).session(session);
    user.totalexpense -= parseFloat(expense.amount);
    if (user.totalexpense < 0) user.totalexpense = 0;

    await user.save({ session });

    // Delete the expense
    await expense.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

/*exports.downloadReport = async (req, res) => {
  const userId = req.userId;

  try {
    // Check if the user is premium
    const user = await User.findById(userId);
    if (!user || !user.isPremium) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all expenses for the user, ordered by creation time (ASC)
    const expenses = await Expense.find({ user: userId }).sort({ createdAt: 1 });

    // Generate PDF buffer (implement convertToPdf to return buffer or base64 string)
    const pdfBuffer = Buffer.from(convertToPdf(expenses)); // or use a library like pdfkit or puppeteer

    const fileName = `Expense_Report_${userId}_${Date.now()}.pdf`;

    // Set up S3 upload parameters
    const s3Params = {
      Bucket: process.env.S3_BUCKET,
      Key: `reports/${fileName}`,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ACL: 'public-read'
    };

    // Upload to S3
    const uploadResult = await s3.upload(s3Params).promise();

    // Return the file URL
    res.json({ fileUrl: uploadResult.Location });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating or uploading PDF' });
  }
};*/
exports.downloadReport = async (req, res) => {
  const userId = req.userId;

  try {
    // Check if user is premium
    const user = await User.findById(userId);
    if (!user || !user.isPremium) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const expenses = await Expense.find({ user: userId }).sort({ createdAt: 1 });

    // Set PDF headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Expense_Report.pdf"');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res); // Stream PDF directly to browser

    // --- PDF LOGIC ---
    const dailyRows = [];
    const monthlyTotals = {};
    const yearlyTotals = {};

    expenses.forEach((exp, index) => {
      const date = new Date(exp.createdAt);
      const day = date.toLocaleDateString();
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const year = `${date.getFullYear()}`;

      dailyRows.push([index + 1, day, `Rs ${exp.amount}`, exp.description, exp.category]);

      monthlyTotals[month] = (monthlyTotals[month] || 0) + parseFloat(exp.amount);
      yearlyTotals[year] = (yearlyTotals[year] || 0) + parseFloat(exp.amount);
    });

    const drawTable = (title, headers, rows) => {
      //doc.addPage();
      doc.fontSize(16).text(title, { align: 'center' });
      doc.moveDown();

      doc.fontSize(10);
      const startX = 50;
      let y = doc.y;

      doc.font('Helvetica-Bold');
      headers.forEach((h, i) => {
        doc.text(h, startX + i * 100, y);
      });
      doc.moveDown();
      doc.font('Helvetica');

      rows.forEach(row => {
        y += 20;
        row.forEach((cell, i) => {
          doc.text(cell.toString(), startX + i * 100, y);
        });
      });
      //doc.moveDown();
      doc.addPage();
    };

    // Daily Report
    //doc.fontSize(16).text('Daily Report', { align: 'center' });
    //doc.moveDown();
    drawTable('Daily Report', ['#', 'Date', 'Amount', 'Description', 'Category'], dailyRows);

    // Monthly Report
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];

    const monthlyRows = Object.entries(monthlyTotals).map(([month, total], idx) => {
      const [year, m] = month.split('-');
      return [idx + 1, `${monthNames[parseInt(m) - 1]} ${year}`, `Rs ${total.toFixed(2)}`];
    });

    drawTable('Monthly Report', ['#', 'Month', 'Total Expense'], monthlyRows);

    // Yearly Report
    const yearlyRows = Object.entries(yearlyTotals).map(([year, total], idx) => [
      idx + 1,
      year,
      `Rs ${total.toFixed(2)}`
    ]);

    drawTable('Yearly Report', ['#', 'Year', 'Total Expense'], yearlyRows);

    doc.end(); // Finalize PDF stream
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating PDF report' });
  }
};