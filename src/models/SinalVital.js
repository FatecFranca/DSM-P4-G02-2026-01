const mongoose = require('mongoose');

const SinalVitalSchema = new mongoose.Schema({
  babyId: {
    type: String,
    required: true,
    trim: true
  },
  temperatura: {
    type: Number,
    required: true
  },
  batimentos: {
    type: Number,
    required: true
  },
  dataHora: {
    type: Date,
    default: Date.now // Registra automaticamente o momento exato da coleta
  }
});

module.exports = mongoose.model('SinalVital', SinalVitalSchema);