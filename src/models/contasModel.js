const { contas } = require('../dados/banco');

function listarPorUsuario(usuarioId) {
  return contas.filter(conta => conta.usuarioId === usuarioId);
}

function buscarPorId(id, usuarioId) {
  return contas.find(conta =>
    conta.id === id && conta.usuarioId === usuarioId
  );
}

function criar(conta) {
  contas.push(conta);
  return conta;
}

function atualizar(id, usuarioId, dados) {
  const conta = buscarPorId(id, usuarioId);

  if (!conta) {
    return null;
  }

  if (dados.nome !== undefined) {
    conta.nome = dados.nome;
  }

  if (dados.saldoInicialCentavos !== undefined) {
    conta.saldoInicialCentavos = dados.saldoInicialCentavos;
  }

  return conta;
}

function excluir(id, usuarioId) {
  const indice = contas.findIndex(conta =>
    conta.id === id && conta.usuarioId === usuarioId
  );

  if (indice === -1) {
    return false;
  }

  contas.splice(indice, 1);
  return true;
}

module.exports = {
  listarPorUsuario,
  buscarPorId,
  criar,
  atualizar,
  excluir
};