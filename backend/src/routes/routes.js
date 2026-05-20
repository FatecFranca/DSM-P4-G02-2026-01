const express = require('express');
const routes = express.Router();

// Importamos o Controller que acabamos de criar
const SinalVitalController = require('../controllers/SinalVitalController');

// Rota para o ESP32 enviar dados
routes.post('/vitals', SinalVitalController.store);

// Rota para a ONG/Mãe ver os dados
routes.get('/vitals', SinalVitalController.index);

module.exports = routes;