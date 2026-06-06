const Bebe = require('../models/Bebe');

module.exports = {
  async show(req, res) {
    try {
      const { id } = req.params;
      const bebe = await Bebe.findOne({ babyId: id });

      if (!bebe) {
        return res.status(404).json({ erro: 'Bebê não encontrado.' });
      }

      return res.json(bebe);
    } catch (error) {
      console.error('Erro ao buscar bebê:', error);
      return res.status(500).json({ erro: 'Erro ao buscar bebê.' });
    }
  }
};
