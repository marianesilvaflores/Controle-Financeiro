const { sessoes } = require('../dados/banco');
const { enviarErro } = require('../utils/erros');

function autenticar(req, res, next) {
  const autorizacao = req.headers.authorization;

  if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
    return enviarErro(res, 401, 'unauthorized', 'Envie o token de login.');
  }

  const token = autorizacao.slice(7);

  const sessao = sessoes.find(sessao =>
    sessao.token === token && sessao.expiraEm > Date.now()
  );

  if (!sessao) {
    return enviarErro(res, 401, 'unauthorized', 'Sessão inválida ou expirada.');
  }

  req.usuarioId = sessao.usuarioId;
  next();
}

module.exports = autenticar;