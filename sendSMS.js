const express = require("express");
const router = express.Router();
const Parent = require("./models/parentModel");
const dotenv = require("dotenv");
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOEKN;

const twilio = require("twilio");
const client = new twilio.Twilio(accountSid, authToken);

// Function to send SMS
async function sendSMS(message) {
  try {
    // Send SMS using Twilio API
    const response = await client.messages.create({
      body: message,
      to: "+919602787267", // Recipient's phone number
      from: "+12565408134", // Your Twilio phone number
    });

    return response.sid; // Return SID of the sent SMS
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error; // Throw error if SMS sending fails
  }
}

//router
router.post("/send-sms", async (req, res) => {
  const { message } = req.body; // Get message from request body

  try {
    // Send SMS using sendSMS function
    const smsSid = await sendSMS(message);

    res
      .status(200)
      .json({ success: true, message: "SMS sent successfully", smsSid });
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send SMS",
      error: error.message,
    });
  }
});

module.exports = router;
