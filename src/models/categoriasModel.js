const { categorias } = require('../dados/banco');

function listarPorUsuario(usuarioId) {
  return categorias.filter(categoria =>
    categoria.usuarioId === usuarioId
  );
}

function criar(dados) {
  const id = categorias.length
    ? Math.max(...categorias.map(categoria => categoria.id)) + 1
    : 1;

  const categoria = {
    id,
    usuarioId: dados.usuarioId,
    nome: dados.nome,
    tipo: dados.tipo
  };

  categorias.push(categoria);
  return categoria;
}

module.exports = {
  listarPorUsuario,
  criar
};