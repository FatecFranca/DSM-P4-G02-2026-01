const express = require('express');
const conectarDB = require('./config/db'); 
require('dotenv').config();

const app = express();

app.use(express.json());

conectarDB(); 

let registros = [];

app.get('/', (req, res) => {
  res.send('API NeoVinculo rodando');
});

app.post('/temperatura', (req, res) => {
  const { babyId, valor } = req.body; // Pega o ID do bebê e a temperatura

  const novoRegistro = {
    babyId: babyId || "Desconhecido",
    temperatura: Number(valor),
    data: new Date() // Isso aqui é ouro para a matéria de Estatística!
  };

  if (novoRegistro.temperatura > 37.5) {
    console.log(`⚠️ ALERTA CRÍTICO: Bebê ${babyId} com temperatura de ${valor}°C!`);
  }

  registros.push(novoRegistro);
  res.json({ mensagem: 'Sinal vital recebido e processado' });
});

app.get('/temperaturas', (req, res) => {
  res.json(registros);
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});