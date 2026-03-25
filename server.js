javascript
const express = require('express');
const app = express();

app.use(express.json());

let registros = [];

app.get('/', (req, res) => {
  res.send('API NeoVinculo rodando');
});

app.post('/temperatura', (req, res) => {
  const dados = req.body;

  registros.push(dados);

  console.log(dados);

  res.json({ mensagem: 'Dados recebidos' });
});

app.get('/temperaturas', (req, res) => {
  res.json(registros);
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});