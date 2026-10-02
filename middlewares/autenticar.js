const { sessoes } = require('../dados/banco');

function autenticar(req, res, next) {
  const autorizacao = req.headers.authorization;

  if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
    return res.status(401).json({
      erro: 'Envie o token de login.'
    });
  }

  const token = autorizacao.slice(7);

  const sessao = sessoes.find(sessao =>
    sessao.token === token && sessao.expiraEm > Date.now()
  );

  if (!sessao) {
    return res.status(401).json({
      erro: 'Sessão inválida ou expirada.'
    });
  }

  req.usuarioId = sessao.usuarioId;
  next();
}

module.exports = autenticar;