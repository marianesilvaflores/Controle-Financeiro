const lancamentosService = require('../services/lancamentosService');

function responderErro(erro, res) {
  const status = erro.status || 500;

  if (status === 500) {
    console.error(erro);
  }

  return res.status(status).json({
    erro: status === 500 ? 'Erro interno no servidor.' : erro.message
  });
}

async function listar(req, res) {
  try {
    const lancamentos = await lancamentosService.listar(req.usuarioId);
    return res.status(200).json(lancamentos);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

async function buscarPorId(req, res) {
  try {
    const lancamento = await lancamentosService.buscarPorId(
      req.params.id,
      req.usuarioId
    );

    return res.status(200).json(lancamento);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

async function criar(req, res) {
  try {
    const lancamento = await lancamentosService.criar(
      req.usuarioId,
      req.body
    );

    return res.status(201).json(lancamento);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

async function atualizar(req, res) {
  try {
    const lancamento = await lancamentosService.atualizar(
      req.params.id,
      req.usuarioId,
      req.body
    );

    return res.status(200).json(lancamento);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

async function excluir(req, res) {
  try {
    await lancamentosService.excluir(req.params.id, req.usuarioId);
    return res.status(204).send();
  } catch (erro) {
    return responderErro(erro, res);
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir
};