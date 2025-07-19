require('dotenv').config();
const nodemailer = require('nodemailer');

const sendEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email, // string, not array
      subject: 'Registration OTP',
      text: `This is your OTP: ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // or return false based on your preference
  }
};

module.exports = sendEmail;
