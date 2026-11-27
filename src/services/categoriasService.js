const crypto = require('node:crypto');
const categoriasModel = require('../models/categoriasModel');

function gerarErro(mensagem, status) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

async function listar(usuarioId) {
  return categoriasModel.buscarTodas(usuarioId);
}

async function criar(usuarioId, dados) {
  const { nome, tipo } = dados || {};

  if (typeof nome !== 'string' || !nome.trim()) {
    throw gerarErro('O campo "nome" é obrigatório.', 400);
  }

  if (!['receita', 'despesa'].includes(tipo)) {
    throw gerarErro(
      'O campo "tipo" deve ser "receita" ou "despesa".',
      400
    );
  }

  return categoriasModel.inserir({
    id: crypto.randomUUID(),
    usuarioId,
    nome: nome.trim(),
    tipo
  });
}

module.exports = {
  listar,
  criar
};