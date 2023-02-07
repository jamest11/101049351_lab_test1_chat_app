const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from_user: {
    type: String,
    required: true,
    trim: true,
  },
  room: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
},{ 
  timestamps: { 
    createdAt: 'date_sent', 
    updatedAt: false 
  } 
});

module.exports = mongoose.model('message', messageSchema, 'Messages');