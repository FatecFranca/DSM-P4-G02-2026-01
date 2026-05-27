const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');
const routes = require('./routes/routes'); 
require('dotenv').config();

const app = express();

// Conecta ao MongoDB Atlas
conectarDB();

app.use(cors());
app.use(express.json());

// Usa as rotas definidas no arquivo routes.js
app.use(routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` NeoVínculo rodando na porta ${PORT}`);
});