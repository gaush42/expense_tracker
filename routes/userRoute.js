const express = require('express')
const router = express.Router()
const signUpController = require('../controller/userController')
const forgotpassword = require('../controller/forgotPassController')

router.post("/signup", signUpController.RegisterUser)
router.post("/login", signUpController.Login)
router.get('/checkpremiumstatus', signUpController.CheckPremiumStatus)

router.post('/password/forgotpassword', forgotpassword.sendResetLink);
router.get('/password/resetpassword/:id', forgotpassword.getResetForm);
router.post('/password/updatepassword/:id', forgotpassword.resetPassword);

module.exports = router