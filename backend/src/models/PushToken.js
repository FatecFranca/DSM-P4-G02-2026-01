const mongoose = require('mongoose');

const PushTokenSchema = new mongoose.Schema({
  bebeId: {
    type: String,
    required: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    trim: true
  },
  plataforma: {
    type: String,
    trim: true
  },
  deviceId: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PushToken', PushTokenSchema);
