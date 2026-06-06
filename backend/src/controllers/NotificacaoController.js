const PushToken = require('../models/PushToken');

module.exports = {
  async store(req, res) {
    try {
      const { bebeId, token, plataforma, deviceId } = req.body;

      if (!bebeId || !token) {
        return res.status(400).json({ erro: 'bebeId e token são obrigatórios.' });
      }

      const existing = await PushToken.findOne({ bebeId, token });
      if (existing) {
        return res.status(200).json({ mensagem: 'Token já cadastrado.' });
      }

      const pushToken = await PushToken.create({
        bebeId,
        token,
        plataforma,
        deviceId
      });

      return res.status(201).json(pushToken);
    } catch (error) {
      console.error('Erro ao salvar token de notificação:', error);
      return res.status(500).json({ erro: 'Erro ao salvar token de notificação.' });
    }
  }
};
