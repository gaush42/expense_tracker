const { v4: uuidv4 } = require('uuid');
const ForgotPasswordRequest = require('../model/forgotPassReqModel');
const User = require('../model/userModel');
const sendResetPasswordEmail = require('../utils/sendmail');
const bcrypt = require('bcryptjs');
const path = require('path');

exports.sendResetLink = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetRequestId = uuidv4();
        await ForgotPasswordRequest.create({
            id: resetRequestId,
            userId: user.id,
            isActive: true
        });

        await sendResetPasswordEmail(user, resetRequestId);

        res.status(200).json({ message: 'Reset password link sent to email' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.getResetForm = async (req, res) => {
  const { id } = req.params;

  const request = await ForgotPasswordRequest.findOne({ where: { id } });
  if (!request || !request.isActive) {
    return res.status(400).send('Link expired or invalid');
  }

  res.sendFile(path.join(__dirname, '../views/resetPasswordForm.html'));
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const request = await ForgotPasswordRequest.findOne({ where: { id }, include: User });

  if (!request || !request.isActive) {
    return res.status(400).json({ message: 'Invalid or expired reset link' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user's password
  request.User.password = hashedPassword;
  await request.User.save();

  // Deactivate the reset link
  request.isActive = false;
  await request.save();

  res.json({ message: 'Password reset successful' });
};
