const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    recipient: {
      type: String,
      enum: ['teacher', 'parent', 'classTeacher'], // Removed 'principal'
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher', // Reference to Teacher model if needed
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent', // Reference to Parent model if needed
    },
    classTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassTeacher', // Reference to ClassTeacher model if needed
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
