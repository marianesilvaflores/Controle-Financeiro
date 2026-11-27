const sessoesModel = require('../models/sessoesModel');

async function autenticar(req, res, next) {
  try {
    const autorizacao = req.headers.authorization;

    if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
      return res.status(401).json({
        erro: 'Envie o token de login.'
      });
    }

    const token = autorizacao.slice(7);
    const sessao = await sessoesModel.buscarPorId(token);

    if (!sessao || sessao.expiraEm <= Date.now()) {
      return res.status(401).json({
        erro: 'Sessão inválida ou expirada.'
      });
    }

    req.usuarioId = sessao.usuarioId;
    return next();
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: 'Erro interno no servidor.'
    });
  }
}

module.exports = autenticar;