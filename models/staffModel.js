// models/staffModel.js
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'school', 
    required: true
  },
  name: {
    type: String,
    required: true
  },
  post:{
    type:String,
    required:true
  },
  salary: {
    type: Number,
    required: true
  }
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
