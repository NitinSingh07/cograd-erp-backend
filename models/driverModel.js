// models/driverModel.js
const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  busNumber: {
    type: String,
    required: true,
  },
  pickUpPoints: {
    type: [String], // Array of strings for pick-up points
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School', // Reference to the school
    required: true,
  },
});

module.exports = mongoose.model('Driver', driverSchema);
