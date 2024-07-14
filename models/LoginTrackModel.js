const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loginTrackSchema = new Schema({
  teacherId: {
    type: String,
    required: true,
  },
  selfie: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  loginTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model('LoginTrack', loginTrackSchema);
