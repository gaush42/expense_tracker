// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        // Basic email regex validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: true
  },
  totalexpense: {
    type: Number,
    default: 0
  },
  isPremium: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
