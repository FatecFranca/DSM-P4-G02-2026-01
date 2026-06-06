const mongoose = require('mongoose');

const BebeSchema = new mongoose.Schema({
  babyId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nome: {
    type: String,
    trim: true
  },
  dataNascimento: {
    type: Date
  },
  sexo: {
    type: String,
    enum: ['M', 'F', 'O'],
    default: 'O'
  }
});

module.exports = mongoose.model('Bebe', BebeSchema);
