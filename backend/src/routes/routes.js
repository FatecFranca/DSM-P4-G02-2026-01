const express = require('express');
const routes = express.Router();

// controller
const SinalVitalController = require('../controllers/SinalVitalController');

/**
 * @swagger
 * /vitals/{babyId}:
 *   get:
 *     summary: Filtra sinais vitais por ID do bebê
 *     description: Retorna a lista de batimentos e temperatura de um prematuro específico.
 *     parameters:
 *       - in: path
 *         name: babyId
 *         required: true
 *         description: "O identificador do bebê (ex: Prematuro_01)"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sucesso ao retornar dados.
 *       404:
 *         description: Bebê não encontrado.
 */
routes.get('/vitals/:babyId', SinalVitalController.show);

// Rota para o ESP32 enviar dados
routes.post('/vitals', SinalVitalController.store);

/**
 * @swagger
 * /vitals:
 *   get:
 *     summary: Retorna todos os sinais vitais
 *     description: Lista o histórico completo de todos os bebês para análise da ONG.
 *     responses:
 *       200:
 *         description: Lista de dados retornada com sucesso.
 */
routes.get('/vitals', SinalVitalController.index);

module.exports = routes;