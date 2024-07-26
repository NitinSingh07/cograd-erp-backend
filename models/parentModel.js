const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "PARENT",
    },
    qualification: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
      required: true,
    },
    contact: {
      type: String,
      required: true,
      unique: true,
    },
    students: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "student",
          required: true,
        },
        fees: {
          admission: {
            type: Number,
            default: 0,
            required: true,
          },
          tuition: {
            type: Number,
            default: 0,
            required: true,
          },
          exams: {
            type: Number,
            default: 0,
            required: true,
          },
          maintenance: {
            type: Number,
            default: 0,
            required: true,
          },
          others: {
            type: Number,
            default: 0,
            required: true,
          },
        },
      },
    ],
    payments: [
      {
        paidAmount: {
          type: Number,
          required: true,
        },
        receipt: {
          type: String,
          required: true,
        },
        date: {
          type: Number,
          default: Date.now(),
        },
        remainingAmount: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("parent", parentSchema);
