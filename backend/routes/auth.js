const express = require('express');
const { register, verifyEmail } = require('../controllers/authController');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', register);
router.get('/verify/:token', verifyEmail);
router.post('/login',authController.login);

module.exports = router;
