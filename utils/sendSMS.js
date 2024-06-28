const dotenv = require("dotenv");
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOEKN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

const twilio = require("twilio");
const client = new twilio.Twilio(accountSid, authToken);

// Function to send SMS
exports.sendSMS = async (phoneNumber, message) => {
  try {
    // Send SMS using Twilio API
    const response = await client.messages.create({
      body: message,
      to: `+91${phoneNumber}`, // Recipient's phone number
      from: fromNumber, // Your Twilio phone number
    });

    return response.sid; // Return SID of the sent SMS
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error; // Throw error if SMS sending fails
  }
};
