const express = require('express');
const routes = express.Router();

// controllers
const SinalVitalController = require('../controllers/SinalVitalController');
const AuthController = require('../controllers/AuthController');
const BebeController = require('../controllers/BebeController');
const ColetaController = require('../controllers/ColetaController');
const EstatisticaController = require('../controllers/EstatisticaController');

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: usuario@exemplo.com
 *         senha:
 *           type: string
 *           example: senha123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         bebe:
 *           $ref: '#/components/schemas/Bebe'
 *     Bebe:
 *       type: object
 *       properties:
 *         babyId:
 *           type: string
 *         nome:
 *           type: string
 *         dataNascimento:
 *           type: string
 *           format: date
 *         sexo:
 *           type: string
 *           enum: [M, F, O]
 *     Coleta:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         babyId:
 *           type: string
 *         temperatura:
 *           type: number
 *         batimentos:
 *           type: number
 *         dataHora:
 *           type: string
 *           format: date-time
 *     EstatisticasDia:
 *       type: object
 *       properties:
 *         bebeId:
 *           type: string
 *         data:
 *           type: string
 *           format: date
 *         totalColetas:
 *           type: integer
 *         mediaBatimentos:
 *           type: number
 *         mediaTemperatura:
 *           type: number
 *         minBatimentos:
 *           type: integer
 *         maxBatimentos:
 *           type: integer
 *         minTemperatura:
 *           type: number
 *         maxTemperatura:
 *           type: number
 *     HistoricoHora:
 *       type: object
 *       properties:
 *         bebeId:
 *           type: string
 *         dataHora:
 *           type: string
 *           format: date-time
 *         totalColetas:
 *           type: integer
 *         mediaBatimentos:
 *           type: number
 *         mediaTemperatura:
 *           type: number
 */
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
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login efetuado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Email ou senha não informados.
 *       401:
 *         description: Credenciais inválidas.
 */
routes.post('/auth/login', AuthController.login);

/**
 * @swagger
 * /bebes/{id}:
 *   get:
 *     summary: Retorna os dados do bebê por ID
 *     description: Busca informações básicas do bebê cadastrado.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "O identificador do bebê (ex: Prematuro_01)"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bebê encontrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bebe'
 *       404:
 *         description: Bebê não encontrado.
 */
routes.get('/bebes/:id', BebeController.show);

/**
 * @swagger
 * /coletas/{bebeId}:
 *   get:
 *     summary: Retorna coletas de um bebê
 *     description: Consulta o histórico de coletas do bebê, com limite opcional.
 *     parameters:
 *       - in: path
 *         name: bebeId
 *         required: true
 *         description: "O identificador do bebê (ex: Prematuro_01)"
 *         schema:
 *           type: string
 *       - in: query
 *         name: limite
 *         required: false
 *         description: "Quantidade máxima de coletas retornadas"
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de coletas retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Coleta'
 */
routes.get('/coletas/:bebeId', ColetaController.index);

/**
 * @swagger
 * /estatisticas/{bebeId}/dia:
 *   get:
 *     summary: Estatísticas do bebê por dia
 *     description: Retorna as estatísticas agregadas de batimentos e temperatura para um bebê em uma data específica.
 *     parameters:
 *       - in: path
 *         name: bebeId
 *         required: true
 *         description: "O identificador do bebê (ex: Prematuro_01)"
 *         schema:
 *           type: string
 *       - in: query
 *         name: data
 *         required: true
 *         description: "Data no formato YYYY-MM-DD"
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Estatísticas do dia retornadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstatisticasDia'
 *       400:
 *         description: Parâmetro data inválido ou ausente.
 *       404:
 *         description: Nenhuma coleta encontrada para a data informada.
 */
routes.get('/estatisticas/:bebeId/dia', EstatisticaController.estatisticasDia);

/**
 * @swagger
 * /estatisticas/{bebeId}/horas:
 *   get:
 *     summary: Histórico de estatísticas por hora
 *     description: Retorna as estatísticas agregadas por hora para as últimas N horas.
 *     parameters:
 *       - in: path
 *         name: bebeId
 *         required: true
 *         description: "O identificador do bebê (ex: Prematuro_01)"
 *         schema:
 *           type: string
 *       - in: query
 *         name: horas
 *         required: true
 *         description: "Quantidade de horas anteriores para retorno do histórico"
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico de horas retornado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistoricoHora'
 *       400:
 *         description: Parâmetro horas inválido ou ausente.
 */
routes.get('/estatisticas/:bebeId/horas', EstatisticaController.historicoHoras);

/**
 * @swagger
 * /coletas/{bebeId}/ultima:
 *   get:
 *     summary: Retorna a última coleta de um bebê
 *     description: Busca a coleta mais recente do bebê pelo ID.
 *     parameters:
 *       - in: path
 *         name: bebeId
 *         required: true
 *         description: "O identificador do bebê (ex: Prematuro_01)"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Última coleta retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coleta'
 *       404:
 *         description: Nenhuma coleta encontrada.
 */
routes.get('/coletas/:bebeId/ultima', ColetaController.ultima);

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