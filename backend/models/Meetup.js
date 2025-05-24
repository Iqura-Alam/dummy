const mongoose = require('mongoose');

const MeetupSchema = new mongoose.Schema({
  productId: String,
  buyerId: String,
  sellerId: String,
  location: {
    lat: Number,
    lng: Number
  },
  confirmations: [String], // store user IDs who confirmed
  status: {
    type: String,
    enum: ['pending', 'confirmed'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Meetup', MeetupSchema);
