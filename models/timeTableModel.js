const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  timePeriod: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /\d{2}:\d{2}-\d{2}:\d{2}/.test(v);
      },
      message: props => `${props.value} is not a valid time period!`
    },
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
}, {
  timestamps: true,
});

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
