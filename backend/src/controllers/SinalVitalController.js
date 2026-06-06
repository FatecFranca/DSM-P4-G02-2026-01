// controllers/SinalVitalController.js
const SinalVital = require('../models/SinalVital');

module.exports = {
  async index(req, res) {
    try {
      const sinais = await SinalVital.find().sort({ dataHora: -1 }).exec();
      return res.json(sinais);
    } catch (err) {
      return res.status(500).json({ erro: err.message });
    }
  },

  async show(req, res) {
    try {
      const { babyId } = req.params;
      const sinais = await SinalVital.find({ babyId }).sort({ dataHora: -1 }).exec();
      if (!sinais || sinais.length === 0) {
        return res.status(404).json({ erro: 'Bebê não encontrado ou sem sinais.' });
      }
      return res.json(sinais);
    } catch (err) {
      return res.status(500).json({ erro: err.message });
    }
  },

  async store(req, res) {
    try {
      const { babyId, temperatura, batimentos } = req.body;

      const coleta = await SinalVital.create({ babyId, temperatura, batimentos, dataHora: new Date() });

      const io = req.app.get('io');
      if (io) {
        io.to(babyId).emit('nova-coleta', coleta);

        const tempAnormal = temperatura < 36.5 || temperatura > 37.5;
        const bpmAnormal = batimentos < 120 || batimentos > 160;

        if (tempAnormal || bpmAnormal) {
          io.to(babyId).emit('alerta-vital', {
            tipo: tempAnormal ? 'temperatura' : 'batimentos',
            mensagem: tempAnormal
              ? `Temperatura fora do normal: ${temperatura}°C`
              : `Batimentos fora do normal: ${batimentos} bpm`,
            coleta,
          });
        }
      }

      return res.status(201).json(coleta);
    } catch (err) {
      return res.status(500).json({ erro: err.message });
    }
  }
};