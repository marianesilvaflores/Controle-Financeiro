const { obterBanco } = require('../config/mongodb');

async function inserir(conta) {
  const documento = { ...conta };
  await obterBanco().collection('contas').insertOne(documento);

  return conta;
}

async function buscarTodas(usuarioId) {
  return obterBanco()
    .collection('contas')
    .find({ usuarioId }, { projection: { _id: 0 } })
    .toArray();
}

async function buscarPorId(id, usuarioId) {
  return obterBanco().collection('contas').findOne(
    { id, usuarioId },
    { projection: { _id: 0 } }
  );
}

async function atualizar(id, usuarioId, dados) {
  return obterBanco().collection('contas').findOneAndUpdate(
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
    .collection('contas')
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