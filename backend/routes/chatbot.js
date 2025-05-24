const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Listing = require('../models/Listing');  // <-- import your Listing model

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple function to extract keywords from user message for DB search
function extractKeywords(message) {
  // For simplicity, just split by spaces and filter short words
  return message
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 2);
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Extract keywords for DB search
    const keywords = extractKeywords(message);

    // Build MongoDB query for listings where title or description matches any keyword
    const searchRegexes = keywords.map(k => new RegExp(k, 'i'));
    const listings = await Listing.find({
  $or: [
    { title: { $in: searchRegexes } },
    { description: { $in: searchRegexes } },
    { category: { $in: searchRegexes } },
    { type: { $in: searchRegexes } },
    { university: { $in: searchRegexes } }
  ]
}).limit(5);  // limit results for performance

    // Format listings for prompt
    let listingsText = 'Here are some matching listings:\n';
    if (listings.length === 0) {
      listingsText = 'No matching listings found.';
    } else {
      listings.forEach((listing, idx) => {
        listingsText += `${idx + 1}. ${listing.title} - ${listing.description} | Price: ${listing.price} | Condition: ${listing.condition}\n`;
      });
    }

    // Compose system + user messages including listings
    const systemMessage = "You are a helpful assistant that helps users find items or services in a campus buy/sell platform.";
    const userPrompt = `User asked: "${message}". ${listingsText} Provide a helpful, concise response based on these listings.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userPrompt },
      ],
    });

    const botReply = response.choices[0].message.content;
    res.json({ reply: botReply });

  } catch (error) {
    console.error('OpenAI API or DB error:', error);
    res.status(500).json({ error: 'Failed to get response from OpenAI or database' });
  }
});

module.exports = router;