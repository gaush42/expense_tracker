const sequelize = require('../config/dbConfig');
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
        return_url: `http://13.232.161.75/html/login.html?order_id=${orderId}`,
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

exports.handleCashfreeWebhook = async (req, res) => {

  try {
    // Verify the webhook signature using Cashfree SDK
    /*const response = await cashfree.PGVerifyWebhookSignature(
      req.headers["x-webhook-signature"], // Webhook signature header
      JSON.stringify(req.body), // Webhook payload
      req.headers["x-webhook-timestamp"] // Webhook timestamp header
    );*/
    //console.log(response); // Log the verification response
    //console.log("✅ Webhook verified");

    //console.log(req);
    const orderId = req.body.data.order.order_id;
    const paymentStatus = req.body.data.payment.payment_status;

    console.log(`Order ID: ${orderId}, Payment Status: ${paymentStatus}`);

    // Find the order
    const order = await Order.findOne({ where: { orderId } });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 🚨 Idempotency check
    if (order.status === 'SUCCESS' || order.status === 'FAILED') {
      console.log("🚫 Order already processed, skipping DB update.");
      return res.status(200).json({ success: true, message: "Already processed" });
    }

    // Process status
    if (paymentStatus === 'SUCCESS') {
      order.status = 'SUCCESS';
      await order.save();

      const user = await User.findByPk(order.userId);
      user.isPremium = true;
      await user.save();

      return res.json({ message: "Payment successful, user upgraded!" });

    } else if (paymentStatus === 'FAILED') {
      order.status = 'FAILED';
      await order.save();

      return res.json({ message: "Payment failed." });
    }

    return res.status(200).json({ success: true });

  } catch (e) {
    console.error("Webhook Error:", e);
    return res.status(500).json({ success: false });
  }
};