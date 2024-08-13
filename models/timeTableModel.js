const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'class',
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'subject',
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teacher',
    required: true,
  },
  timePeriod: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Validates the time period in the format HH:MMAM-HH:MMAM or HH:MMPM-HH:MMPM, or 'X'
        return /^(\d{2}:\d{2}(AM|PM))-(\d{2}:\d{2}(AM|PM))$|^X$/.test(v);
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
