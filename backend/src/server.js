const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');
const routes = require('./routes/routes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();

// Conecta ao MongoDB Atlas
conectarDB();

app.use(cors());
app.use(express.json());

// --- CONFIGURAÇÃO DO SWAGGER ---
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'NeoVínculo API',
      version: '1.0.0',
      description: 'Documentação da API de monitoramento de sinais vitais PI 4° semestre',
      contact: { name: 'Ana Júlia - Backend Lead' }
    },
    servers: [{ url: 'http://localhost:3000', description: 'Servidor Local' }],
  },
  apis: ['./src/routes/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- ROTAS ---
app.use(routes);

// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 NeoVínculo rodando na porta ${PORT}`);
  console.log(`📄 Documentação disponível em http://localhost:${PORT}/api-docs`);
});