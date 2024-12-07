const express = require('express');
const { loginUser, registerUser } = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const router = express.Router();


router.post('/login', loginUser);

router.post('/register', registerUser);

router.get('/:id', );


module.exports = router;
