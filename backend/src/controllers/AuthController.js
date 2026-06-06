const crypto = require('crypto');
const Usuario = require('../models/Usuario');

module.exports = {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
      }

      const usuario = await Usuario.findOne({ email: email.toLowerCase().trim(), senha });

      if (!usuario) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      const token = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : crypto.randomBytes(24).toString('hex');

      return res.json({ token, bebe: usuario.bebe });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ erro: 'Erro ao efetuar login.' });
    }
  }
};
