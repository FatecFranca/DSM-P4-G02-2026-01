const express = require('express');
const cors = require('cors');
const http = require('http');              
const { Server } = require('socket.io'); 
const conectarDB = require('./config/db');
const routes = require('./routes/routes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();
const server = http.createServer(app);   
const io = new Server(server, {         
  cors: { origin: '*' }
});

// Conecta ao MongoDB Atlas
conectarDB();

app.use(cors());
app.use(express.json());

// Disponibiliza o io para os controllers usarem
app.set('io', io);                     

// --- SOCKET.IO ---
io.on('connection', (socket) => {
  console.log('📱 App conectado:', socket.id);

  // App entra na sala do bebê que ela monitora
  socket.on('entrar-sala', (babyId) => {
    socket.join(babyId);
    console.log(`Mamãe entrou na sala: ${babyId}`);
  });

  socket.on('disconnect', () => {
    console.log('📱 App desconectado:', socket.id);
  });
});

// --- CONFIGURAÇÃO DO SWAGGER ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NeoVínculo API',
      version: '1.0.0',
      description: 'API de monitoramento de sinais vitais',
    },
  },
  apis: ['./src/routes/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- ROTAS ---
app.use(routes);

// --- INICIALIZAÇÃO (server, não app) ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {           
  console.log(`🚀 NeoVínculo rodando na porta ${PORT}`);
  console.log(`📄 Documentação disponível em http://localhost:${PORT}/api-docs`);
});