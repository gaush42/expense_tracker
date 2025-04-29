const Sib = require('sib-api-v3-sdk');
require('dotenv').config();

const client = Sib.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.SIB_API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

async function sendResetPasswordEmail(user, resetRequestId) {
    try {
        const resetUrl = `http://localhost:3000/password/resetpassword/${resetRequestId}`;

        const sender = {
            email: 'your_verified_email@example.com',  // Your verified sender email
            name: 'Expense Tracker App'
        };

        const receivers = [
            {
                email: user.email,
                name: user.name || user.email.split('@')[0]
            }
        ];

        const emailData = {
            sender,
            to: receivers,
            subject: "Password Reset - Expense Tracker",
            htmlContent: `
                <p>Hello ${user.name || ''},</p>
                <p>You requested to reset your password.</p>
                <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
                <p>This link is valid for one-time use only.</p>
                <p>Regards,<br/>Expense Tracker Team</p>
            `
        };

        await tranEmailApi.sendTransacEmail(emailData);
        console.log('Reset password email sent successfully.');

    } catch (error) {
        console.error('Failed to send reset password email:', error);
        throw error;
    }
}

module.exports = { sendResetPasswordEmail };
