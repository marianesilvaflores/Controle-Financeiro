const express = require('express');
const routesContas = require('./routes/contas');

const app = express();
const PORTA = 3000;

app.use(express.json());
app.use('/contas', routesContas);

app.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'API de controle financeiro pessoal',
    status: 'ok'
  });
});

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});