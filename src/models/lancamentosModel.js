const { obterBanco } = require('../config/mongodb');

async function inserir(lancamento) {
  const documento = { ...lancamento };
  await obterBanco().collection('lancamentos').insertOne(documento);

  return lancamento;
}

async function buscarTodas(usuarioId) {
  return obterBanco()
    .collection('lancamentos')
    .find({ usuarioId }, { projection: { _id: 0 } })
    .toArray();
}

async function buscarPorId(id, usuarioId) {
  return obterBanco().collection('lancamentos').findOne(
    { id, usuarioId },
    { projection: { _id: 0 } }
  );
}

async function atualizar(id, usuarioId, dados) {
  return obterBanco().collection('lancamentos').findOneAndUpdate(
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
    .collection('lancamentos')
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