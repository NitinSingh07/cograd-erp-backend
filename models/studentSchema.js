const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // rollNum: {
  //     type: Number,
  //     required: true
  // },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    default: "STUDENT",
  },
  profile: {
    type: String,
    required: true,
  },
  className: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "class",
    required: true,
  },
  schoolName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "school",
    required: true,
  },
  fathersName: {
    type: String,
    required: true,
  },
  fatherEmail: {
    type: String,
  },
  documents: [
    {
      name: { type: String },
      url: { type: String },
    },
  ],
  phoneNumber: { type: String },

  pastFeedbacks: [
    {
      date: { type: Date },
      purpose: { type: String },
      summary: { type: String },
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "teacher" }, // Adding teacherId here
    },
  ],
  upcomingFeedbacks: [
    {
      date: { type: Date },
      purpose: { type: String },
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "teacher" }, // Adding teacherId here
    },
  ],
  callHistory: [
    {
      time: { type: Date },
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "teacher" }, // Adding teacherId here
    },
  ],
  // mothersName: {
  //     type: String,
  //     required: true
  // },
  dob: {
    type: Date,
    // required: true
  },
  // aadharCardNo: {
  //     type: String,
  //     required: true
  // },
  // category: {
  //     type: String,
  //     enum: ['SC', 'OBC', 'ST'],
  //     required: true
  // },
  // religion: {
  //     type: String,
  //     required: true
  // },
  // permanentAddress: {
  //     type: String,
  //     required: true
  // },
  // phoneNumber: {
  //     type: String,
  //     required: true
  // },
  // motherTongue: {
  //     type: String,
  //     required: true
  // },
  // nationality: {
  //     type: String,
  //     required: true
  // },
  // busFacilitiesRequired: {
  //     type: Boolean,
  //     default: false
  // },
  // sex: {
  //     type: String,
  //     enum: ['Male', 'Female'],
  //     required: true
  // },
  // admissionSoughtForClass: {
  //     type: String,
  //     required: true
  // },
  // Add more fields as needed
});

module.exports = mongoose.model("student", studentSchema);
