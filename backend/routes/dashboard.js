// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing'); // Assuming you already have a Listing model
const auth = require('../middleware/auth');

// GET /api/dashboard/recent
router.get('/recent', auth, async (req, res) => {
  try {
    const listings = await Listing.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent listings" });
  }
});

module.exports = router;
