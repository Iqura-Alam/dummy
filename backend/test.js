const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const University = require('./models/University'); // ✅ Correct import path

const seedUniversities = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Optional: Clear existing data if you want
  await University.deleteMany({});
  console.log(typeof University); // should be 'function'
console.log(Object.keys(University)); // should include 'insertMany'


  await University.insertMany([
    { name: 'Islamic University of Technology', domain: 'iut-dhaka.edu' },
    { name: 'University of Dhaka', domain: 'du.ac.bd' },
    { name: 'Bangladesh University of Engineering and Technology', domain: 'buet.ac.bd' },
    { name: 'North South University', domain: 'northsouth.edu' },
    { name: 'BRAC University', domain: 'bracu.ac.bd' }
  ]);

  console.log('✅ Universities seeded!');
  await mongoose.disconnect();
};

seedUniversities().catch(err => console.error('❌ Error:', err));
