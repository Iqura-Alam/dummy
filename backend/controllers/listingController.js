const Listing = require('../models/Listing');

exports.createListing = async (req, res) => {
  try {
    const newListing = new Listing({
      ...req.body,
      owner: req.user._id // assuming you use JWT middleware to attach user to req
    });
    const saved = await newListing.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
