const usuariosService = require('../services/usuariosService');

function responderErro(erro, res) {
  const status = erro.status || 500;

  if (status === 500) {
    console.error(erro);
  }

  return res.status(status).json({
    erro: status === 500 ? 'Erro interno no servidor.' : erro.message
  });
}

async function cadastrar(req, res) {
  try {
    const usuario = await usuariosService.cadastrar(req.body);
    return res.status(201).json(usuario);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

async function login(req, res) {
  try {
    const resultado = await usuariosService.login(req.body);
    return res.status(200).json(resultado);
  } catch (erro) {
    return responderErro(erro, res);
  }
}

module.exports = {
  cadastrar,
  login
};