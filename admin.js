const mongoose = require('mongoose');
const User = require('./models/userModel');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken')

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}


dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminExists = await User.findOne({ email: adminEmail });
    if (adminExists) {
      console.log('Admin already exists');
      mongoose.connection.close();
      return;
    }

    const admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD,
      isAdmin: true,
    });

    console.log('Admin created successfully:', {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      isAdmin: admin.isAdmin,
      token: generateToken(admin._id)
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.connection.close();
  }
};

createAdmin();
