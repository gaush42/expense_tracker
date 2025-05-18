const express = require('express')
const router = express.Router()
const expenseController = require('../controller/expenseController')
const auth = require('../middleware/auth')

router.post("/addexpense",auth.authenticate, expenseController.AddExpense)
router.get("/getexpense/",auth.authenticate, expenseController.GetExpenses)
router.delete("/deleteexpense/:id", auth.authenticate, expenseController.deleteExpense)
router.get('/report/download',auth.authenticate, expenseController.downloadReport)

module.exports = router