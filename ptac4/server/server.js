const express = require('express');
const cors = require('cors');
const routesContas = require('./routes/contas');
const rotasUsuarios = require('./routes/usuarios');
const routesCategorias = require('./routes/categorias');
const routesLancamentos = require('./routes/lancamentos');
const routesRelatorios = require('./routes/relatorios');
const { enviarErro } = require('./utils/erros');

const app = express();
const PORTA = process.env.PORT || 3000;


app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'API de controle financeiro pessoal',
    status: 'ok'
  });
});


const api = express.Router();
api.use('/usuarios', rotasUsuarios);
api.use('/contas', routesContas);
api.use('/categorias', routesCategorias);
api.use('/lancamentos', routesLancamentos);
api.use('/relatorios', routesRelatorios);
app.use('/api/v1', api);


app.use((req, res) => {
  return enviarErro(res, 404, 'not_found', 'Rota não encontrada.');
});


app.use((erro, req, res, next) => {
  if (erro.type === 'entity.parse.failed') {
    return enviarErro(res, 400, 'validation', 'JSON inválido.');
  }

  console.error(erro);
  return enviarErro(res, 500, 'internal', 'Erro interno do servidor.');
});

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});