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

/**
 * @swagger
 * /vitals:
 *   post:
 *     summary: Recebe dados do ESP32
 *     description: Salva os batimentos e temperatura enviados pela pulseira IoT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               babyId:
 *                 type: string
 *                 example: Prematuro_01
 *               temperatura:
 *                 type: number
 *                 example: 36.8
 *               batimentos:
 *                 type: number
 *                 example: 125
 *     responses:
 *       201:
 *         description: Sinais vitais salvos com sucesso no MongoDB.
 *       500:
 *         description: Erro interno no servidor.
 */
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