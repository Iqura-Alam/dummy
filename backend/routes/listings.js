const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

// Utility: Build visibility filter based on logged in user's university
function getVisibilityFilter(userUniversity) {
  return {
    $or: [
      { visibility: 'Global' },            // visible to all
      { visibility: 'UniversityOnly', university: userUniversity } // visible to same university
    ]
  };
}

// GET /api/listings/recent
router.get('/recent', auth, async (req, res) => {
  try {
    const filter = getVisibilityFilter(req.user.university);
    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent listings" });
  }
});

// GET /api/listings
router.get('/listings', auth, async (req, res) => {
  try {
    const filter = getVisibilityFilter(req.user.university);
    const listings = await Listing.find(filter);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// GET /api/listings/search?q=
router.get('/search', auth, async (req, res) => {
  const q = req.query.q || '';
  try {
    const filter = {
      $and: [
        getVisibilityFilter(req.user.university),
        {
          $or: [
            { title: new RegExp(q, 'i') },
            { description: new RegExp(q, 'i') }
          ]
        }
      ]
    };
    const listings = await Listing.find(filter);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// GET /api/listings/category/:category
router.get('/category/:category', auth, async (req, res) => {
  const cat = req.params.category;
  try {
    const filter = {
      $and: [
        getVisibilityFilter(req.user.university),
        { category: cat }
      ]
    };
    const listings = await Listing.find(filter);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Filter failed" });
  }
});

// POST /api/listings - Create a new listing
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      priceType,
      condition,
      visibility, // expect 'Global' or 'UniversityOnly'
      type
    } = req.body;

    // Validate visibility input
    if (!['Global', 'UniversityOnly'].includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility option' });
    }

    const listing = new Listing({
      title,
      description,
      category,
      price,
      priceType,
      condition,
      visibility,
      type,
      university: req.user.university,
      owner: req.user._id,
      createdAt: new Date()
    });

    await listing.save();
    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
// Example route in your listings router
router.get('/price', async (req, res) => {
  const min = parseFloat(req.query.min);
  const max = parseFloat(req.query.max);

  if (isNaN(min) || isNaN(max)) {
    return res.status(400).json({ message: "Invalid price range" });
  }

  try {
    const listings = await Listing.find({
      price: { $gte: min, $lte: max }
    });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
