const crypto = require('node:crypto');
const contasModel = require('../models/contasModel');

function gerarErro(mensagem, status) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

async function listar(usuarioId) {
  return contasModel.buscarTodas(usuarioId);
}

async function buscarPorId(id, usuarioId) {
  const conta = await contasModel.buscarPorId(id, usuarioId);

  if (!conta) {
    throw gerarErro('Conta não encontrada.', 404);
  }

  return conta;
}

async function criar(usuarioId, dados) {
  const { nome, saldoInicialCentavos } = dados || {};

  if (typeof nome !== 'string' || nome.trim() === '') {
    throw gerarErro('O nome da conta é obrigatório.', 400);
  }

  if (!Number.isSafeInteger(saldoInicialCentavos)) {
    throw gerarErro(
      'O saldo inicial deve ser um número inteiro em centavos.',
      400
    );
  }

  const conta = {
    id: crypto.randomUUID(),
    usuarioId,
    nome: nome.trim(),
    saldoInicialCentavos
  };

  return contasModel.inserir(conta);
}

async function atualizar(id, usuarioId, dados) {
  await buscarPorId(id, usuarioId);

  const { nome, saldoInicialCentavos } = dados || {};

  if (nome === undefined && saldoInicialCentavos === undefined) {
    throw gerarErro(
      'Informe nome ou saldo inicial para atualizar.',
      400
    );
  }

  if (
    nome !== undefined &&
    (typeof nome !== 'string' || nome.trim() === '')
  ) {
    throw gerarErro(
      'O nome da conta deve ser um texto não vazio.',
      400
    );
  }

  if (
    saldoInicialCentavos !== undefined &&
    !Number.isSafeInteger(saldoInicialCentavos)
  ) {
    throw gerarErro(
      'O saldo inicial deve ser um número inteiro em centavos.',
      400
    );
  }

  const alteracoes = {};

  if (nome !== undefined) {
    alteracoes.nome = nome.trim();
  }

  if (saldoInicialCentavos !== undefined) {
    alteracoes.saldoInicialCentavos = saldoInicialCentavos;
  }

  const conta = await contasModel.atualizar(
    id,
    usuarioId,
    alteracoes
  );

  if (!conta) {
    throw gerarErro('Conta não encontrada.', 404);
  }

  return conta;
}

async function excluir(id, usuarioId) {
  const excluiu = await contasModel.remover(id, usuarioId);

  if (!excluiu) {
    throw gerarErro('Conta não encontrada.', 404);
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir
};