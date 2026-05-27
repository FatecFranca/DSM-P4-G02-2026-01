const SinalVital = require('../models/SinalVital');

module.exports = {
  // Função para salvar novos dados (o ESP32)
  async store(req, res) {
    try {
      const { babyId, temperatura, batimentos } = req.body;

      const novaLeitura = await SinalVital.create({
        babyId,
        temperatura,
        batimentos
      });

      // Lógica de Alerta 
      if (temperatura >= 37.5) {
        console.log(`⚠️ ALERTA: Bebê ${babyId} com febre!`);
      }

      return res.status(201).json(novaLeitura);
    } catch (error) {
      return res.status(400).json({ erro: 'Erro ao salvar dados' });
    }
  },

  // Função para listar tudo (a ONG e a Estatística)
  async index(req, res) {
    try {
      const registros = await SinalVital.find().sort({ dataHora: -1 });
      return res.json(registros);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao buscar dados' });
    }
  },

  // Função para mostrar dados de um bebê específico
async show(req, res) {
  try {
    const { babyId } = req.params; // Pega o ID que vem na URL
    const registros = await SinalVital.find({ babyId }).sort({ dataHora: -1 });
    
    if (registros.length === 0) {
      return res.status(404).json({ mensagem: 'Nenhum dado encontrado para este bebê.' });
    }

    return res.json(registros);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar dados do bebê específico' });
  }
}
};