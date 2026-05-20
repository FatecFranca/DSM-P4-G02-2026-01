const SinalVital = require('../models/SinalVital');

module.exports = {
  // Função para salvar novos dados (o ESP32 vai usar esta)
  async store(req, res) {
    try {
      const { babyId, temperatura, batimentos } = req.body;

      const novaLeitura = await SinalVital.create({
        babyId,
        temperatura,
        batimentos
      });

      // Lógica de Alerta (O diferencial do seu projeto!)
      if (temperatura > 37.5) {
        console.log(`⚠️ ALERTA: Bebê ${babyId} com febre!`);
      }

      return res.status(201).json(novaLeitura);
    } catch (error) {
      return res.status(400).json({ erro: 'Erro ao salvar dados' });
    }
  },

  // Função para listar tudo (a ONG e a Estatística vão usar esta)
  async index(req, res) {
    try {
      const registros = await SinalVital.find().sort({ dataHora: -1 });
      return res.json(registros);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao buscar dados' });
    }
  }
};