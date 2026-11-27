const { obterBanco } = require('../config/mongodb');

async function inserir(categoria) {
  const documento = { ...categoria };
  await obterBanco().collection('categorias').insertOne(documento);
  return categoria;
}

async function buscarTodas(usuarioId) {
  return obterBanco()
    .collection('categorias')
    .find({ usuarioId }, { projection: { _id: 0 } })
    .toArray();
}

async function buscarPorId(id, usuarioId) {
  return obterBanco().collection('categorias').findOne(
    { id, usuarioId },
    { projection: { _id: 0 } }
  );
}

async function atualizar(id, usuarioId, dados) {
  return obterBanco().collection('categorias').findOneAndUpdate(
    { id, usuarioId },
    { $set: dados },
    {
      returnDocument: 'after',
      includeResultMetadata: false,
      projection: { _id: 0 }
    }
  );
}

async function remover(id, usuarioId) {
  const resultado = await obterBanco()
    .collection('categorias')
    .deleteOne({ id, usuarioId });

  return resultado.deletedCount === 1;
}

module.exports = {
  inserir,
  buscarTodas,
  buscarPorId,
  atualizar,
  remover
};