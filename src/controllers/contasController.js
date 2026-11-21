const contasService = require('../services/contasService');

function responderErro(erro, res) {
  const status = erro.status || 500;

  if (status === 500) {
    console.error(erro);
  }

  return res.status(status).json({
    erro: status === 500 ? 'Erro interno no servidor.' : erro.message
  });
}

function listar(req, res) {
  try {
    const contas = contasService.listar(req.usuarioId);
    return res.status(200).json(contas);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

function buscarPorId(req, res) {
  try {
    const conta = contasService.buscarPorId(
      req.params.id,
      req.usuarioId
    );

    return res.status(200).json(conta);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

function criar(req, res) {
  try {
    const conta = contasService.criar(req.usuarioId, req.body);
    return res.status(201).json(conta);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

function atualizar(req, res) {
  try {
    const conta = contasService.atualizar(
      req.params.id,
      req.usuarioId,
      req.body
    );

    return res.status(200).json(conta);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

function excluir(req, res) {
  try {
    contasService.excluir(req.params.id, req.usuarioId);
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
