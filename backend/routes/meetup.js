const express = require('express');
const router = express.Router();
const Meetup = require('../models/Meetup');

// Create meetup
router.post('/', async (req, res) => {
  const { productId, buyerId, sellerId, location } = req.body;

  try {
    const newMeetup = await Meetup.create({
      productId,
      buyerId,
      sellerId,
      location,
      confirmations: []
    });
    res.json(newMeetup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirm meetup
router.post('/confirm', async (req, res) => {
  const { meetupId, userId } = req.body;

  try {
    const meetup = await Meetup.findById(meetupId);
    if (!meetup.confirmations.includes(userId)) {
      meetup.confirmations.push(userId);
    }

    if (meetup.confirmations.length === 2) {
      meetup.status = 'confirmed';
    }

    await meetup.save();
    res.json(meetup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get meetup
router.get('/:id', async (req, res) => {
  try {
    const meetup = await Meetup.findById(req.params.id);
    res.json(meetup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
