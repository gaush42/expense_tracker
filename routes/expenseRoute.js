const express = require('express')
const router = express.Router()
const expenseController = require('../controller/expenseController')

router.post("/addexpense", expenseController.AddExpense)
router.get("/getexpense/:userId", expenseController.GetExpenses)

module.exports = router