const express = require('express')
const router = express.Router()
const signUpController = require('../controller/userController')

router.post("/signup", signUpController.RegisterUser)
router.post("/login", signUpController.Login)
router.get('/checkpremiumstatus', signUpController.CheckPremiumStatus)

module.exports = router