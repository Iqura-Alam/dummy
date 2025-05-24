const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: { type: String, enum: ['Item', 'Service'], required: true },
  priceType: { type: String, enum: ['Fixed', 'Bidding', 'Hourly'], required: true },
  price: Number,
  condition: { type: String, enum: ['New', 'Used'] },
  category: String,
  visibility: { type: String, enum: ['UniversityOnly', 'Global'], required: true },
  university: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // link to logged in user
},{ timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);