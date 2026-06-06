const SinalVital = require('../models/SinalVital');

module.exports = {
  async index(req, res) {
    try {
      const { bebeId } = req.params;
      const limite = parseInt(req.query.limite, 10);

      const consulta = SinalVital.find({ babyId: bebeId }).sort({ dataHora: -1 });
      if (!Number.isNaN(limite) && limite > 0) {
        consulta.limit(limite);
      }

      const coletas = await consulta.exec();
      return res.json(coletas);
    } catch (error) {
      console.error('Erro ao buscar coletas:', error);
      return res.status(500).json({ erro: 'Erro ao buscar coletas.' });
    }
  },

  async ultima(req, res) {
    try {
      const { bebeId } = req.params;
      const coleta = await SinalVital.findOne({ babyId: bebeId }).sort({ dataHora: -1 });

      if (!coleta) {
        return res.status(404).json({ erro: 'Nenhuma coleta encontrada para este bebê.' });
      }

      return res.json(coleta);
    } catch (error) {
      console.error('Erro ao buscar última coleta:', error);
      return res.status(500).json({ erro: 'Erro ao buscar última coleta.' });
    }
  }
};
