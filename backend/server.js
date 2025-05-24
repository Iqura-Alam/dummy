const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const Listing = require('./models/Listing');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Restrict in production
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

app.get('/api/check-items', async (req, res) => {
  try {
    const items = await Listing.find({});
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Static folder for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));
// Test route
app.get('/', (req, res) => {
  res.send('✅ Server is running!');
});

// Route imports (moved listingRoutes & dashboardRoutes here)
const authRoutes = require('./routes/auth');
const meetupRoutes = require('./routes/meetup');
const chatRoutes = require('./routes/chatRoutes');
const chatbotRoutes = require('./routes/chatbot');
const listingRoutes = require('./routes/listings');
const dashboardRoutes = require('./routes/dashboard');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/meetup', meetupRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Upload endpoint with flexible URL generation
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const protocol = req.protocol;
  const host = req.get('host');
  const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// MongoDB connection and server start
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Socket.IO chat logic
io.on('connection', (socket) => {
  console.log('🟢 New client connected');

  socket.on('joinRoom', ({ roomId }) => {
    socket.join(roomId);
    console.log(`👤 User joined room: ${roomId}`);
  });

  socket.on('chatMessage', ({ roomId, sender, message }) => {
    console.log(`📨 Message in ${roomId} from ${sender}: ${message}`);
    io.to(roomId).emit('chatMessage', { sender, message });
  });

  socket.on('chatImage', ({ roomId, sender, imageUrl }) => {
    console.log(`🖼️ Image in ${roomId} from ${sender}: ${imageUrl}`);
    io.to(roomId).emit('chatImage', { sender, imageUrl });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected');
  });
});


app.use('/api/listings', listingRoutes);

// server.js
app.use('/api/dashboard', dashboardRoutes);
const institutes = [
  // Universities - Dhaka & major cities
  { name: 'University of Dhaka', latitude: 23.7291, longitude: 90.4075 },
  { name: 'Bangladesh University of Engineering and Technology (BUET)', latitude: 23.7271, longitude: 90.3923 },
  { name: 'North South University', latitude: 23.8134, longitude: 90.4125 },
  { name: 'BRAC University', latitude: 23.7866, longitude: 90.4070 },
  { name: 'Independent University Bangladesh (IUB)', latitude: 23.8132, longitude: 90.4191 },
  { name: 'East West University', latitude: 23.7523, longitude: 90.3795 },
  { name: 'American International University-Bangladesh (AIUB)', latitude: 23.7925, longitude: 90.4036 },
  { name: 'University of Rajshahi', latitude: 24.3751, longitude: 88.6256 },
  { name: 'Jahangirnagar University', latitude: 23.8817, longitude: 90.2645 },
  { name: 'Chittagong University', latitude: 22.4605, longitude: 91.7825 },
  { name: 'Khulna University', latitude: 22.8025, longitude: 89.5330 },
  { name: 'Bangladesh Agricultural University', latitude: 24.3696, longitude: 88.6040 },
  { name: 'Shahjalal University of Science and Technology', latitude: 24.9150, longitude: 91.8335 },
  { name: 'Bangabandhu Sheikh Mujibur Rahman Agricultural University', latitude: 24.0966, longitude: 90.0760 },
  { name: 'Rajshahi University of Engineering & Technology', latitude: 24.3810, longitude: 88.6247 },
  { name: 'Bangladesh University of Professionals', latitude: 23.7985, longitude: 90.3667 },
  { name: 'National University, Bangladesh', latitude: 23.8103, longitude: 90.4125 },
  { name: 'University of Science and Technology Chittagong', latitude: 22.4881, longitude: 91.7885 },
  { name: 'Dhaka University of Engineering & Technology, Gazipur', latitude: 23.9980, longitude: 90.4119 },
  { name: 'Military Institute of Science and Technology', latitude: 23.8377, longitude: 90.3579 },
  { name: 'American International University of Bangladesh', latitude: 23.7951, longitude: 90.4035 },

  // Medical Colleges
  { name: 'Dhaka Medical College', latitude: 23.7477, longitude: 90.3972 },
  { name: 'Sir Salimullah Medical College', latitude: 23.7581, longitude: 90.4076 },
  { name: 'Chittagong Medical College', latitude: 22.3512, longitude: 91.8246 },
  { name: 'Rajshahi Medical College', latitude: 24.3740, longitude: 88.6156 },

  // Islamic University of Technology (IUT) - Included here
  { name: 'Islamic University of Technology (IUT)', latitude: 23.9481, longitude: 90.3793 },

  // Engineering & Technical Institutions
  { name: 'Bangladesh Institute of Technology, Rajshahi', latitude: 24.3664, longitude: 88.6241 },
  { name: 'Bangladesh Institute of Technology, Chittagong', latitude: 22.4087, longitude: 91.7989 },
  { name: 'Bangladesh University of Textiles (BUTEX)', latitude: 23.7548, longitude: 90.3901 },

  // Colleges and other major educational institutions
  { name: 'Dhaka College', latitude: 23.7294, longitude: 90.4102 },
  { name: 'Notre Dame College, Dhaka', latitude: 23.7517, longitude: 90.3980 },
  { name: 'Rajshahi College', latitude: 24.3736, longitude: 88.6243 },
  { name: 'Chittagong College', latitude: 22.3481, longitude: 91.8237 },
  { name: 'Comilla Victoria Government College', latitude: 23.4600, longitude: 91.1794 },

  // Polytechnic Institutes
  { name: 'Dhaka Polytechnic Institute', latitude: 23.7382, longitude: 90.3954 },
  { name: 'Rajshahi Polytechnic Institute', latitude: 24.3755, longitude: 88.6259 },
  { name: 'Chittagong Polytechnic Institute', latitude: 22.3819, longitude: 91.8100 },

  // Agricultural Universities
  { name: 'Patuakhali Science and Technology University', latitude: 22.3526, longitude: 90.3442 },
  { name: 'Sher-e-Bangla Agricultural University', latitude: 23.7163, longitude: 90.4131 },

  // Others
  { name: 'Islamic University, Bangladesh', latitude: 23.7470, longitude: 90.2458 },
  { name: 'Hajee Mohammad Danesh Science & Technology University', latitude: 25.0183, longitude: 88.8945 },
  { name: 'Noakhali Science and Technology University', latitude: 22.8232, longitude: 91.1070 },
  { name: 'Jatiya Kabi Kazi Nazrul Islam University', latitude: 24.2287, longitude: 88.8082 },
  { name: 'Bangabandhu Sheikh Mujib Medical University', latitude: 23.7431, longitude: 90.3859 },

  // Additional institutes spread across districts (sample, add more as needed)
  { name: 'Jessore University of Science and Technology', latitude: 23.1690, longitude: 89.2030 },
  { name: 'Barisal University', latitude: 22.7036, longitude: 90.3533 },
  { name: 'Begum Rokeya University', latitude: 25.7351, longitude: 89.2732 },
  { name: 'Khulna Medical College', latitude: 22.8153, longitude: 89.5582 },
  { name: 'Rajshahi Cadet College', latitude: 24.3634, longitude: 88.6062 },
  { name: 'Dinajpur Medical College', latitude: 25.6289, longitude: 88.6390 },
  { name: 'Pabna University of Science and Technology', latitude: 24.0003, longitude: 89.2502 },

  // Technical Training Institutes
  { name: 'Technical Training Center, Dhaka', latitude: 23.7454, longitude: 90.3967 },
  { name: 'Bangladesh Navy School and College', latitude: 23.8074, longitude: 90.4090 },

  // Sample additions
  { name: 'Dhaka International University', latitude: 23.7546, longitude: 90.3895 },
  { name: 'World University of Bangladesh', latitude: 23.8125, longitude: 90.4231 },
  { name: 'Premier University', latitude: 23.8129, longitude: 90.4113 },
  { name: 'University of Liberal Arts Bangladesh', latitude: 23.7452, longitude: 90.3760 },
  { name: 'Ahsanullah University of Science and Technology', latitude: 23.7449, longitude: 90.4081 },
  { name: 'Independent University, Bangladesh', latitude: 23.8131, longitude: 90.4192 },
  { name: 'State University of Bangladesh', latitude: 23.7282, longitude: 90.4105 }
];
app.get('/api/institutes', (req, res) => {
  const q = req.query.q?.toLowerCase() || '';
  const matches = institutes.filter(i => i.name.toLowerCase().includes(q));
  res.json(matches);
});