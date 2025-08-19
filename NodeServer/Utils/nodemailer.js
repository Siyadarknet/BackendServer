const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (str, data) => {
  try {
    let Osubject, Ohtml;

    if (str === "forgetPassword") {
      Osubject = "Reset Password - SOFIA App";
      Ohtml = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #2E86C1;">SOFIA App - Reset Password</h1>
          <p>Click the link below to reset your password:</p>
          <p><a href="${data.resetUrl}" style="background-color: #2E86C1; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>This link will expire soon. If you didn’t request a password reset, please ignore this email.</p>
        </div>
      `;
    } else if (str === "signup") {
      Osubject = "Welcome to the SOFIA Family!";
      Ohtml = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #27AE60;">Welcome to SOFIA App 🎉</h1>
          <p>Hi ${data.firstName} ${data.lastName},</p>
          <p>We’re thrilled to have you join us! Your SOFIA journey starts now.</p>
          <p>Email: <strong>${data.email}</strong></p>
          <p style="margin-top: 20px;">Stay tuned for updates and enjoy exploring SOFIA App!</p>
        </div>
      `;
    } else if (str === "sendOtp") {
      Osubject = "SOFIA App - Your OTP Code";
      Ohtml = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #E67E22;">SOFIA App - OTP Verification</h1>
          <p>Hi there,</p>
          <p>Your One-Time Password (OTP) is:</p>
          <h2 style="background: #E67E22; color: white; padding: 10px 20px; display: inline-block; border-radius: 5px;">${data.otp}</h2>
          <p>This OTP will expire in <strong>5 minutes</strong>. Please use it to verify your account.</p>
          <p>If you didn’t request this, please ignore this email.</p>
          <p style="margin-top: 20px; color: #777;">- The SOFIA App Team</p>
        </div>
      `;
    } else {
      throw new Error("Invalid email type");
    }

    // Create Nodemailer Transporter
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"SOFIA App" <${process.env.MAIL_USER}>`,
      to: data.email,
      subject: Osubject,
      html: Ohtml,
    });

    console.log(" Email sent successfully:", info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error(" Error sending email:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = mailSender;
