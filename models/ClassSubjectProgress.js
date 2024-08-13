const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classSubjectProgressSchema = new Schema({
  class: {
    type: Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  currentChapter: {
    type: Number,
    required: true,
  },
  currentDayInChapter: {
    type: Number,
    required: true,
  },
});

const ClassSubjectProgress = mongoose.model(
  "ClassSubjectProgress",
  classSubjectProgressSchema
);

module.exports = ClassSubjectProgress;
