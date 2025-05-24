// Only show listings from other users at the same university
app.get('/api/explore/recent', verifyToken, async (req, res) => {
  const user = req.user;
  const domain = user.email.split('@')[1];

  const listings = await Listing.find({
    owner: { $ne: user._id },
    university: user.university
  }).sort({ createdAt: -1 });

  res.json(listings);
});

app.get('/api/explore/search', verifyToken, async (req, res) => {
  const query = req.query.q;
  const user = req.user;

  const results = await Listing.find({
    owner: { $ne: user._id },
    university: user.university,
    title: { $regex: query, $options: 'i' }
  });

  res.json(results);
});

app.get('/api/explore/category/:cat', verifyToken, async (req, res) => {
  const category = req.params.cat;
  const user = req.user;

  const results = await Listing.find({
    owner: { $ne: user._id },
    university: user.university,
    category: category
  });

  res.json(results);
});
