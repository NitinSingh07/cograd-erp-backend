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
  logoutTime: {
    type: Date,
  },
  logoutLatitude: {
    type: Number,
  },
  logoutLongitude: {
    type: Number,
  },
  inSchool: {
    type: Boolean,
    default: false,
  },
  inSchoolAtLogout: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('LoginTrack', loginTrackSchema);
