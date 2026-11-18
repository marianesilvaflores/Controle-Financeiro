const { lancamentos } = require('../dados/banco');

function listarLancamentos(usuarioId) {
  return lancamentos.filter(lancamento =>
    lancamento.usuarioId === usuarioId
  );
}

module.exports = { listarLancamentos };