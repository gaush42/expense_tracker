// controllers/paymentController.js
const sequelize = require('../config/dbConfig');
const Order = require('../model/orderModel');
const User = require('../model/userModel')
const { Cashfree } = require('cashfree-pg');
const crypto = require('crypto');
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

  const t = await sequelize.transaction();

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
        return_url: `http://13.232.161.75//html/login.html?order_id=${orderId}`,
        notify_url: `http://13.232.161.75/api/cashfree-webhook`,
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
    }, {transaction: t});

    await t.commit();
    res.json({ paymentSessionId: response.data.payment_session_id });

  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

/*exports.verifyPayment = async (req, res) => {
  const orderId = req.query.order_id;
  const t = await sequelize.transaction();
  try {
    const response = await cashfree.PGFetchOrder(orderId);
    const txStatus = response.data.order_status; // Values: "PAID", "FAILED", etc.

    const order = await Order.findOne({ where: { orderId }, transaction: t });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (txStatus === 'PAID') {
      order.status = 'SUCCESSFUL';
      await order.save({transaction: t});

      // Make user premium
      const user = await User.findByPk(order.userId, {transaction: t});
      user.isPremium = true;
      await user.save({transaction: t});

      await t.commit();
      return res.json({ message: "Payment successful, user upgraded!" });

    } else if (txStatus === 'FAILED') {
      order.status = 'FAILED';
      await order.save({transaction: t});

      await t.commit();
      return res.json({ message: "Payment failed." });
    } else {
      return res.json({ message: `Payment status: ${txStatus}` });
    }

  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: 'Failed to verify payment status' });
  }
};*/
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

exports.handleCashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const rawBody = req.body.toString(); // Required for signature verification

    const expectedSignature = crypto
      .createHmac('sha256', CASHFREE_SECRET_KEY)
      .update(rawBody)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.warn("Invalid Cashfree webhook signature");
      return res.status(400).send("Invalid signature");
    }

    const payload = JSON.parse(rawBody);
    const orderId = payload.data.order.order_id;
    const paymentStatus = payload.data.payment.payment_status;

    await Order.update({ status: paymentStatus }, { where: { orderId } });

    if (paymentStatus === "SUCCESS") {
      const order = await Order.findOne({ where: { orderId } });
      if (order) {
        await User.update(
          { premiumMember: true },
          { where: { id: order.userId } }
        );
        console.log("User upgraded to premium:", order.userId);
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ success: false });
  }
};
