const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
  name: { type: String },
  url: { type: String },
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' } // Assuming Teacher model exists
});

module.exports = mongoose.model('Document', documentSchema);
