const { obterBanco } = require('../config/mongodb');

async function inserir(usuario) {
  const colecao = obterBanco().collection('usuarios');

  await colecao.createIndex({ email: 1 }, { unique: true });

  const documento = { ...usuario };
  await colecao.insertOne(documento);

  return usuario;
}

async function buscarTodas(filtro = {}) {
  return obterBanco()
    .collection('usuarios')
    .find(filtro)
    .toArray();
}

async function buscarPorId(id) {
  return obterBanco().collection('usuarios').findOne({ id });
}

async function atualizar(id, dados) {
  return obterBanco().collection('usuarios').findOneAndUpdate(
    { id },
    { $set: dados },
    {
      returnDocument: 'after',
      includeResultMetadata: false
    }
  );
}

async function remover(id) {
  const resultado = await obterBanco()
    .collection('usuarios')
    .deleteOne({ id });

  return resultado.deletedCount === 1;
}

module.exports = {
  inserir,
  buscarTodas,
  buscarPorId,
  atualizar,
  remover
};