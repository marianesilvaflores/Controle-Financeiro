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

async function validar(usuarioId, dados) {
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

  return {
    descricao: descricao.trim(),
    tipo,
    valorCentavos,
    data,
    contaId,
    categoriaId
  };
}

async function criar(usuarioId, dados) {
  const campos = await validar(usuarioId, dados);
  return lancamentosModel.inserir({ id: crypto.randomUUID(), usuarioId, ...campos });
}

async function buscarPorId(id, usuarioId) {
  const lancamento = await lancamentosModel.buscarPorId(id, usuarioId);
  if (!lancamento) throw gerarErro('Lancamento nao encontrado.', 404);
  return lancamento;
}

async function atualizar(id, usuarioId, dados) {
  const atual = await buscarPorId(id, usuarioId);
  const camposPermitidos = ['descricao', 'tipo', 'valorCentavos', 'data', 'contaId', 'categoriaId'];
  if (!dados || !camposPermitidos.some(campo => dados[campo] !== undefined)) {
    throw gerarErro('Informe algum campo do lancamento para atualizar.', 400);
  }
  const campos = await validar(usuarioId, { ...atual, ...dados });
  const alterado = await lancamentosModel.atualizar(id, usuarioId, campos);
  if (!alterado) throw gerarErro('Lancamento nao encontrado.', 404);
  return alterado;
}

async function excluir(id, usuarioId) {
  const removeu = await lancamentosModel.remover(id, usuarioId);
  if (!removeu) throw gerarErro('Lancamento nao encontrado.', 404);
}

module.exports = { listar, criar, buscarPorId, atualizar, excluir };
