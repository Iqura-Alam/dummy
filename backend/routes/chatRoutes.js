const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/chatMessage');

// GET: Fetch messages for a room
router.get('/:roomId/messages', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ roomId: req.params.roomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST: Save a new message
router.post('/:roomId/message', async (req, res) => {
  const { sender, message } = req.body;
  const { roomId } = req.params;

  if (!sender || !message) {
    return res.status(400).json({ error: 'Sender and message are required' });
  }

  try {
    const newMessage = new ChatMessage({ roomId, sender, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

module.exports = router;
