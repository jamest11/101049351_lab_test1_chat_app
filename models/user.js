const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minLength: 6
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 6
  },
},{ 
  timestamps: {
    createdAt: true,
    updatedAt: false
  }
});

module.exports = mongoose.model('user', userSchema, 'Users');