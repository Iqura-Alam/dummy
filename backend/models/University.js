const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  domain: { type: String, required: true }
});

module.exports = mongoose.model('University', universitySchema);
