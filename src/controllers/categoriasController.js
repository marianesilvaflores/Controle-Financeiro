const categoriasService = require('../services/categoriasService');

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
    const categorias = categoriasService.listar(req.usuarioId);
    return res.status(200).json(categorias);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

function criar(req, res) {
  try {
    const categoria = categoriasService.criar(
      req.usuarioId,
      req.body
    );

    return res.status(201).json(categoria);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

module.exports = {
  listar,
  criar
};