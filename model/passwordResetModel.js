// models/forgotPasswordRequestModel.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const forgotPasswordRequestSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4 // Use UUID string as the _id
  },
  isactive: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Optional alias if you still want to call it 'id'
forgotPasswordRequestSchema.virtual('id').get(function () {
  return this._id;
});

forgotPasswordRequestSchema.set('toJSON', { virtuals: true });
forgotPasswordRequestSchema.set('toObject', { virtuals: true });

const ForgotPasswordRequest = mongoose.model('ForgotPasswordRequest', forgotPasswordRequestSchema);
module.exports = ForgotPasswordRequest;
