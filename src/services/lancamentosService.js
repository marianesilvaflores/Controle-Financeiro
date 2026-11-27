const crypto = require('node:crypto');
const lancamentosModel = require('../models/lancamentosModel');
const contasModel = require('../models/contasModel');
const categoriasModel = require('../models/categoriasModel');

function gerarErro(mensagem, status) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

async function listar(usuarioId) {
  return lancamentosModel.buscarTodas(usuarioId);
}

async function criar(usuarioId, dados) {
  const { descricao, tipo, valorCentavos, data, contaId, categoriaId } = dados || {};

  if (typeof descricao !== 'string' || !descricao.trim()) {
    throw gerarErro('A descricao e obrigatoria.', 400);
  }
  if (!['receita', 'despesa'].includes(tipo)) {
    throw gerarErro('O tipo deve ser receita ou despesa.', 400);
  }
  if (!Number.isSafeInteger(valorCentavos) || valorCentavos <= 0) {
    throw gerarErro('O valor deve ser um inteiro positivo em centavos.', 400);
  }
  if (typeof data !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(data)) {
    throw gerarErro('Informe a data no formato AAAA-MM-DD.', 400);
  }
  const dataConvertida = new Date(data);
  if (Number.isNaN(dataConvertida.getTime()) || dataConvertida.toISOString().slice(0, 10) !== data) {
    throw gerarErro('Informe uma data valida.', 400);
  }
  if (typeof contaId !== 'string' || !contaId.trim() ||
      typeof categoriaId !== 'string' || !categoriaId.trim()) {
    throw gerarErro('Informe a conta e a categoria.', 400);
  }
  const conta = await contasModel.buscarPorId(contaId, usuarioId);
  if (!conta) {
    throw gerarErro('Conta nao encontrada.', 404);
  }
  const categoria = await categoriasModel.buscarPorId(categoriaId, usuarioId);
  if (!categoria) {
    throw gerarErro('Categoria nao encontrada.', 404);
  }
  if (categoria.tipo !== tipo) {
    throw gerarErro('O tipo do lancamento deve ser igual ao da categoria.', 400);
  }

  return lancamentosModel.inserir({
    id: crypto.randomUUID(),
    usuarioId,
    descricao: descricao.trim(),
    tipo,
    valorCentavos,
    data,
    contaId,
    categoriaId
  });
}

module.exports = { listar, criar };
