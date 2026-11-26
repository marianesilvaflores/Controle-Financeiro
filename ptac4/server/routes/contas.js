const express = require('express');
const crypto = require('node:crypto');
const autenticar = require('../middlewares/autenticar');
const { contas, lancamentos } = require('../dados/banco');
const { enviarErro } = require('../utils/erros');

const router = express.Router();

router.use(autenticar);

function buscarConta(req) {
  return contas.find(conta =>
    conta.id === req.params.id &&
    conta.usuarioId === req.usuarioId
  );
}


router.get('/', (req, res) => {
  const minhasContas = contas.filter(conta =>
    conta.usuarioId === req.usuarioId
  );

  return res.status(200).json({
    data: minhasContas,
    meta: { total: minhasContas.length }
  });
});


router.post('/', (req, res) => {
  const { nome, saldoInicialCentavos } = req.body || {};

  if (typeof nome !== 'string' || nome.trim() === '') {
    return enviarErro(res, 400, 'validation', 'O nome da conta é obrigatório.');
  }

  if (!Number.isSafeInteger(saldoInicialCentavos)) {
    return enviarErro(res, 400, 'validation',
      'O saldo inicial deve ser um número inteiro em centavos.');
  }

  const conta = {
    id: crypto.randomUUID(),
    usuarioId: req.usuarioId,
    nome: nome.trim(),
    saldoInicialCentavos
  };

  contas.push(conta);

  return res.status(201).json(conta);
});


router.get('/:id', (req, res) => {
  const conta = buscarConta(req);

  if (!conta) {
    return enviarErro(res, 404, 'not_found', 'Conta não encontrada.');
  }

  return res.status(200).json(conta);
});


router.patch('/:id', (req, res) => {
  const conta = buscarConta(req);

  if (!conta) {
    return enviarErro(res, 404, 'not_found', 'Conta não encontrada.');
  }

  const { nome, saldoInicialCentavos } = req.body || {};

  if (nome === undefined && saldoInicialCentavos === undefined) {
    return enviarErro(res, 400, 'validation',
      'Informe nome ou saldo inicial para atualizar.');
  }

  if (nome !== undefined &&
      (typeof nome !== 'string' || nome.trim() === '')) {
    return enviarErro(res, 400, 'validation',
      'O nome da conta deve ser um texto não vazio.');
  }

  if (saldoInicialCentavos !== undefined &&
      !Number.isSafeInteger(saldoInicialCentavos)) {
    return enviarErro(res, 400, 'validation',
      'O saldo inicial deve ser um número inteiro em centavos.');
  }

  if (nome !== undefined) {
    conta.nome = nome.trim();
  }

  if (saldoInicialCentavos !== undefined) {
    conta.saldoInicialCentavos = saldoInicialCentavos;
  }

  return res.status(200).json(conta);
});


router.delete('/:id', (req, res) => {
  const conta = buscarConta(req);

  if (!conta) {
    return enviarErro(res, 404, 'not_found', 'Conta não encontrada.');
  }

  
  const temLancamentos = lancamentos.some(lancamento =>
    lancamento.contaId === conta.id
  );

  if (temLancamentos) {
    return enviarErro(res, 409, 'conflict',
      'Esta conta possui lançamentos. Exclua os lançamentos primeiro.');
  }

  contas.splice(contas.indexOf(conta), 1);

  return res.status(204).send();
});

module.exports = router;