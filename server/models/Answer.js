const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
  answer: {
    type: String,
    enum: ['yes', 'no'],
    required: true,
  },
  // How many times she tried to click "No" before answering
  dodgeCount: {
    type: Number,
    default: 0,
  },
  // User-agent / rough info for fun
  userAgent: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Answer', answerSchema)
