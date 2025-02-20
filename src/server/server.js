require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" })); // Enable CORS for frontend requests

// Debugging logs
console.log("Starting server...");
console.log("Loaded environment variables:");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "NOT SET");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "MISSING!");

// Email sender setup
const transporter = nodemailer.createTransport({
  service: "gmail", // Change to your email provider if not using Gmail
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// API Endpoint to Send Emails
app.post("/api/send-confirmation-email", async (req, res) => {
  const { email, title, description } = req.body;
  console.log("Received email request:", { email, title, description });

  if (!email || !title || !description) {
    console.error("Error: Missing required fields");
    return res.status(400).json({ error: "Missing required fields" });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Support Ticket Confirmation: ${title}`,
    text: `Hello,\n\nYour support ticket has been created.\n\nTitle: ${title}\nDescription: ${description}\n\nWe will get back to you shortly.\n\nBest regards,\nHelpdesk Team`,
  };

  try {
    console.log("Sending email...");
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", email);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email", details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});