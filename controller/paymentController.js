// controllers/paymentController.js
const Order = require('../model/orderModel');
const User = require('../model/userModel')
const { Cashfree } = require('cashfree-pg');

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

exports.createOrder = async (req, res) => {
  const userId = req.userId;
  const orderId = `order_${Date.now()}`;
  const amount = 99.0; // Premium cost

  try {
    const request = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: `user_${userId}`,
        customer_email: req.user.email,
        customer_phone: "9999999999"
      },
      order_meta: {
        return_url: `http://localhost:5500/premium_success.html?order_id=${orderId}`,
        notify_url: "https://yourserver.com/api/payment/callback"
      }
    };

    const response = await Cashfree.PGCreateOrder("2025-01-01", request);

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
exports.paymentCallback = async (req, res) => {
    const { order_id, txStatus } = req.body;
  
    const order = await Order.findOne({ where: { orderId: order_id } });
  
    if (!order) return res.status(404).json({ message: 'Order not found' });
  
    if (txStatus === 'SUCCESS') {
      order.status = 'SUCCESSFUL';
      await order.save();
  
      // Make user premium
      const user = await User.findByPk(order.userId);
      user.isPremium = true;
      await user.save();
    } else {
      order.status = 'FAILED';
      await order.save();
    }
  
    res.status(200).send('OK');
};
