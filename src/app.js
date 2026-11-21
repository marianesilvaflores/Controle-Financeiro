const express = require('express');
const autenticar = require('./middlewares/autenticar');
const routesContas = require('./routes/contas');
const rotasUsuarios = require('./routes/usuarios');
const routesCategorias = require('./routes/categorias');
const routesRelatorios = require('./routes/relatorios');

const app = express();

app.use(express.json());

app.use('/contas', routesContas);
app.use('/usuarios', rotasUsuarios);
app.use('/categorias', autenticar, routesCategorias);
app.use('/relatorios', routesRelatorios);

app.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'API de controle financeiro pessoal',
    status: 'ok'
  });
});

module.exports = app;