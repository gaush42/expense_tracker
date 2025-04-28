const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const auth = require('../middleware/auth'); // your JWT middleware

// Create order - protected route
router.post('/create', auth.authenticate, paymentController.createOrder);

router.get('/verify-payment', paymentController.verifyPayment);

module.exports = router;
