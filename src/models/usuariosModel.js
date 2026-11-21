const { usuarios, sessoes } = require('../dados/banco');

function buscarPorEmail(email) {
  return usuarios.find(usuario => usuario.email === email);
}

function criar(usuario) {
  usuarios.push(usuario);
  return usuario;
}

function criarSessao(sessao) {
  sessoes.push(sessao);
  return sessao;
}

module.exports = {
  buscarPorEmail,
  criar,
  criarSessao
};