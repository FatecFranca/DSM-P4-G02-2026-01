const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  senha: {
    type: String,
    required: true
  },
  bebe: {
    babyId: {
      type: String,
      required: true,
      trim: true
    },
    nome: {
      type: String,
      trim: true
    }
  }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
