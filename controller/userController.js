const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const User = require('../model/userModel')

exports.RegisterUser = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'Email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUserProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select('fullname email isPremium');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      isPremium: user.isPremium
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};
