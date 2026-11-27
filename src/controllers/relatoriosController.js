const relatoriosService = require('../services/relatoriosService');

function responderErro(erro, res) {
  const status = erro.status || 500;

  if (status === 500) {
    console.error(erro);
  }

  return res.status(status).json({
    erro: status === 500 ? 'Erro interno no servidor.' : erro.message
  });
}

function status(req, res) {
  return res.status(200).json({
    mensagem: 'Rotas de relatórios funcionando.'
  });
}

async function saldoPorConta(req, res) {
  try {
    const resultado = await relatoriosService.saldoPorConta(
      req.params.contaId,
      req.usuarioId
    );

    return res.status(200).json(resultado);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

async function extrato(req, res) {
  try {
    const resultado = await relatoriosService.extrato(
      req.usuarioId,
      req.query
    );

    return res.status(200).json(resultado);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

async function porCategoria(req, res) {
  try {
    const resultado = await relatoriosService.porCategoria(req.usuarioId);
    return res.status(200).json(resultado);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

async function mensal(req, res) {
  try {
    const resultado = await relatoriosService.mensal(req.usuarioId);
    return res.status(200).json(resultado);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

module.exports = {
  status,
  saldoPorConta,
  extrato,
  porCategoria,
  mensal
};