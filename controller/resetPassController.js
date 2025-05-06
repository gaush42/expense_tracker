const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const ForgotPasswordRequest = require('../model/passwordResetModel');
const User = require('../model/userModel');
const Sib = require('sib-api-v3-sdk');
const sequelize = require('../config/dbConfig');


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const client = Sib.ApiClient.instance;
  client.authentications['api-key'].apiKey = process.env.SIB_API_KEY;

  const transEmailApi = new Sib.TransactionalEmailsApi();

  const sender = {
    email: 'aahil5074@gmail.com', // Must be verified in Brevo
    name: 'Day-to-Day Expense'
  };

  const receivers = [{ email: email }]; // Or use the `email` from req.body

  const t = await sequelize.transaction();
  try {
    const user = await User.findOne({ where: { email },
      transaction: t
     });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const id = uuidv4();
    await ForgotPasswordRequest.create({
      id,
      UserId: user.id,
      isactive: true,
    }, {transaction: t});

    await t.commit()

    const result = await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: 'Reset your password',
      /*htmlContent: `<p>Click below to reset your password:</p>
        <a href="http://localhost:3000/api/resetpassword/${id}">Reset Password</a>`,*/
      htmlContent:`
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <p style="font-size: 16px;">Click below to reset your password:</p>
        <a href="http://localhost:3000/api/resetpassword/${id}" 
          style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
          Reset Password
        </a>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          If you didn't request this, you can ignore this email.
        </p>
      </div>
      `
    });

    console.log('Email sent successfully!', result);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    await t.rollback();
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
};

exports.getResetPasswordPage = async (req, res) => {
  try{
    const { id } = req.params;
    const request = await ForgotPasswordRequest.findOne({ where: { id } });
  
    if (!request || !request.isactive) {
      return res.status(400).send('Invalid or expired password reset link.');
    }
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; background: #f1f5f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; width: 100%;">
          <h2 style="text-align: center; color: #1e3a8a;">Reset Your Password</h2>
          <form action="/api/resetpassword/${id}" method="POST" style="display: flex; flex-direction: column; gap: 15px;">
            <label for="password" style="font-weight: bold;">New Password</label>
            <input type="password" id="password" name="password" required 
                   style="padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;" />
            <button type="submit" 
                    style="padding: 12px; background-color: #2563eb; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">
              Reset Password
            </button>
          </form>
        </div>
      </body>
      </html>
    `);
  }catch (err){
    console.error(err);
    res.status(500).send('Something went wrong while loading the reset page.');
  }
        
};

exports.updatePassword = async (req, res) => {
  const t = await sequelize.transaction()
  
  try {
    const { id } = req.params;
    const { password } = req.body;

    const request = await ForgotPasswordRequest.findOne({ where: { id }, transaction: t });
    if (!request || !request.isactive) {
      return res.status(400).send('Invalid or expired password reset request.');
    }

    const user = await User.findByPk(request.UserId, { transaction: t });
    if (!user) {
      return res.status(404).send('User not found.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save({ transaction: t });

    request.isactive = false;
    await request.save({ transaction: t });

    await t.commit();
    res.send('Password updated successfully!');
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).send('Server error.');
  }
};

  