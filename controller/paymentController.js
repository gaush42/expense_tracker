// controllers/paymentController.js
const Order = require('../model/orderModel');
const User = require('../model/userModel')
const { Cashfree } = require('cashfree-pg');
require("dotenv").config()

const cashfree = new Cashfree(Cashfree.SANDBOX, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY)
//Cashfree.XClientId = process.env.CASHFREE_APP_ID;
//Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
//Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

exports.createOrder = async (req, res) => {
  const userId = req.userId;
  const email = req.email;
  const orderId = `order_${Date.now()}`;
  const amount = 99.0; // Premium cost

  try {
    const request = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: `user_${userId}`,
        customer_email: email,
        customer_phone: "9999999999"
      },
      order_meta: {
        return_url: `http://localhost:3000/index.html?order_id=${orderId}`,
        //notify_url: "http://localhost:3000/api/payment/callback",
        payment_methods: "cc,dc,upi"
      }
    };

    const response = await cashfree.PGCreateOrder(request);

    await Order.create({
      orderId,
      paymentSessionId: response.data.payment_session_id,
      amount,
      status: "PENDING",
      userId,
    });

    res.json({ paymentSessionId: response.data.payment_session_id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

exports.verifyPayment = async (req, res) => {
  const orderId = req.query.order_id;

  try {
    const response = await cashfree.PGFetchOrder(orderId);
    const txStatus = response.data.order_status; // Values: "PAID", "FAILED", etc.

    const order = await Order.findOne({ where: { orderId } });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (txStatus === 'PAID') {
      order.status = 'SUCCESSFUL';
      await order.save();

      // Make user premium
      const user = await User.findByPk(order.userId);
      user.isPremium = true;
      await user.save();

      return res.json({ message: "Payment successful, user upgraded!" });
    } else if (txStatus === 'FAILED') {
      order.status = 'FAILED';
      await order.save();

      return res.json({ message: "Payment failed." });
    } else {
      return res.json({ message: `Payment status: ${txStatus}` });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to verify payment status' });
  }
};
