const { obterBanco } = require('../config/mongodb');

async function inserir(sessao) {
  const documento = { ...sessao };
  await obterBanco().collection('sessoes').insertOne(documento);
  return sessao;
}

async function buscarTodas(usuarioId) {
  return obterBanco()
    .collection('sessoes')
    .find({ usuarioId })
    .toArray();
}

async function buscarPorId(id) {
  return obterBanco().collection('sessoes').findOne({ id });
}

async function atualizar(id, dados) {
  return obterBanco().collection('sessoes').findOneAndUpdate(
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
    .collection('sessoes')
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