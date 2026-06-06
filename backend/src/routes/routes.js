const express = require('express');
const routes = express.Router();

// controllers
const SinalVitalController = require('../controllers/SinalVitalController');
const AuthController = require('../controllers/AuthController');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica usuário e retorna token de sessão
 *     description: Recebe email e senha e retorna um token válido junto com os dados do bebê associado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@exemplo.com
 *               senha:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login efetuado com sucesso.
 *       400:
 *         description: Email ou senha não informados.
 *       401:
 *         description: Credenciais inválidas.
 */
routes.post('/auth/login', AuthController.login);

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