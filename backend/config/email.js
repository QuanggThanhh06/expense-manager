require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOtpEmail = async (to, otp) => {
  await transporter.verify();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Mã xác nhận đặt lại mật khẩu - Expense Wallet",
    html: `
      <h2>Expense Wallet</h2>
      <p>Mã xác nhận của bạn là:</p>
      <h1 style="color:#22c55e;">${otp}</h1>
      <p>Mã có hiệu lực trong 5 phút.</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;