const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email });
        const token = generateToken(user._id)
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: token,
            })
            console.log(token)
        } else {
            res.status(401)
            throw new Error('Invalid email or password')
        }
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const userExists = await User.findOne({ email })
        if (userExists) {
            res.status(400)
            throw new Error('User already exists')
        }
        const user = await User.create({
            name,
            email,
            password
        })
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id)
            })
        } else {
            res.status(400)
            throw new Error('Invalid user data')
        }
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


exports.getUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id).select('-password');  
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user details', error });
  }
}