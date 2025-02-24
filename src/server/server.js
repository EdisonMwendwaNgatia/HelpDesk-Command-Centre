require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" })); // Allow frontend requests

// Debugging logs
console.log("Starting server...");
console.log("Loaded environment variables:");
console.log("SMTP_USER:", process.env.SMTP_USER || "NOT SET");
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "Loaded" : "MISSING!");
console.log("EMAIL_FROM:", process.env.EMAIL_FROM || "NOT SET");

// Email sender setup using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com", // Brevo SMTP Server
  port: 587, // TLS Port
  secure: false, // false for 587, true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Helps with certificate issues
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
    from: process.env.EMAIL_FROM, // Verified sender email
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

// NEW API Endpoint for Technician Assignment Emails
app.post("/api/send-assignment-email", async (req, res) => {
  const { email, title, description, department, ipNumber } = req.body;
  console.log("Received technician assignment email request:", { email, title, description, department, ipNumber });

  if (!email || !title || !description || !department || !ipNumber) {
    console.error("Error: Missing required fields");
    return res.status(400).json({ error: "Missing required fields" });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `New Ticket Assignment: ${title}`,
    text: `Hello,\n\nYou have been assigned a new support ticket.\n\nTitle: ${title}\nDescription: ${description}\nDepartment: ${department}\nUser IP Number: ${ipNumber}\n\nPlease check your dashboard for more details.\n\nBest regards,\nHelpdesk Team`,
  };

  try {
    console.log("Sending assignment email...");
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to technician:", email);
    res.status(200).json({ message: "Assignment email sent successfully" });
  } catch (error) {
    console.error("Error sending assignment email:", error);
    res.status(500).json({ error: "Failed to send assignment email", details: error.message });
  }
});

//resolved API user endpoint
app.post("/api/send-resolution-email", async (req, res) => {
  const { email, title, resolutionDetails } = req.body;
  console.log("Received resolution email request:", { email, title, resolutionDetails });

  if (!email || !title || !resolutionDetails) {
    console.error("Error: Missing required fields");
    return res.status(400).json({ error: "Missing required fields" });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Your Support Ticket "${title}" Has Been Resolved`,
    text: `Hello,\n\nThank you for your patience. Your support ticket has been resolved.\n\nTitle: ${title}\nResolution: ${resolutionDetails}\n\nIf you have any further questions, feel free to reach out.\n\nBest regards,\nHelpdesk Team`,
  };

  try {
    console.log("Sending resolution email...");
    await transporter.sendMail(mailOptions);
    console.log("Resolution email sent successfully to:", email);
    res.status(200).json({ message: "Resolution email sent successfully" });
  } catch (error) {
    console.error("Error sending resolution email:", error);
    res.status(500).json({ error: "Failed to send resolution email", details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
