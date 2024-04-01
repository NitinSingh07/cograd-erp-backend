const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("class", classSchema);
