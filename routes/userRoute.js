const express = require('express')
const router = express.Router()
const signUpController = require('../controller/signUp')

router.post("/signup", signUpController.RegisterUser)

module.exports = router