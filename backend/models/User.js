// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, required: true, unique: true },
//   password: String,
//   emailVerified: { type: Boolean, default: false },

//   // Optional academic profile
//   university: String,
//   department: String,
//   program: String,
//   year: String,

//   // Admin-only fields
//   phone: String,
//   dob: Date,

//   emailVerificationToken: String,
// });

// module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  university: String,
  department: String,
  program: String,
  year: String,
  phone: String,
  dob: Date,
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
