require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com", 
  port: 587, 
  secure: false, 
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
});

const sendTestEmail = async () => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM, 
      to: process.env.EMAIL_TO, 
      subject: "Test Email",
      text: "Hello, this is a test email from your Node.js app!",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

sendTestEmail();
