const express = require('express')
const router = express.Router()
const signUpController = require('../controller/userController')
const auth = require('../middleware/auth')
const leaderboard = require('../controller/leaderboardController')
const resetPass = require('../controller/resetPassController')

router.post("/signup", signUpController.RegisterUser)
router.post("/login", signUpController.Login)
router.get('/userprofile',auth.authenticate, signUpController.getUserProfile)
router.get('/leaderboard',auth.authenticate, leaderboard.getLeaderboard)

router.post('/forgotpassword', resetPass.forgotPassword);
router.get('/resetpassword/:id', resetPass.getResetPasswordPage);
router.post('/resetpassword/:id', resetPass.updatePassword);

module.exports = router