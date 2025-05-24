const User = require('../models/User');
const University = require('../models/University');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');


exports.register = async (req, res) => {
  const { name, email, password, university, department, program, year, phone, dob } = req.body;

  try {
    const universityEntry = await University.findOne({ name: university });
    if (!universityEntry) return res.status(400).json({ message: 'Invalid university selected.' });

    const expectedDomain = universityEntry.domain;
    const actualDomain = email.split('@')[1];

    if (actualDomain !== expectedDomain) {
      return res.status(400).json({
        message: `Email must match ${expectedDomain}`
      });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const user = new User({
      name, email, password: hashedPassword, university, department, program,
      year, phone, dob, emailVerificationToken: token
    });

    await user.save();

    const link = `http://localhost:3000/api/auth/verify/${token}`;
    await sendEmail(email, 'Verify your student account', `Click to verify: <a href="${link}">${link}</a>`);

    res.status(201).json({ message: 'Registration successful. Check your email to verify.' });
  } catch (err) {
   console.error("❌ Registration error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const { email } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid link' });

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified. You can now log in.' });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password.' });

    // Check email verification
    // if (!user.isVerified) {
    //   return res.status(403).json({ message: 'Please verify your email first.' });
    // }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password.' });

    // Generate JWT
    const token = jwt.sign(
  { _id: user._id, email: user.email, university: user.university },
  process.env.JWT_SECRET || 'secret123',
  { expiresIn: '1d' }
);


    // Send success response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
