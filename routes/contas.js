const express = require('express');
const crypto = require('node:crypto');

const router = express.Router();

const contas = [];

router.get('/', (req, res) => {
  res.status(200).json(contas);
});

router.post('/', (req, res) => {
  const { nome, saldoInicialCentavos } = req.body || {};

  if (typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({
      erro: 'O nome da conta é obrigatório.'
    });
  }

  if (!Number.isSafeInteger(saldoInicialCentavos)) {
    return res.status(400).json({
      erro: 'O saldo inicial deve ser um número inteiro em centavos.'
    });
  }

  const conta = {
    id: crypto.randomUUID(),
    nome: nome.trim(),
    saldoInicialCentavos
  };

  contas.push(conta);

  return res.status(201).json(conta);
});
router.get('/:id', (req, res) => {
  const conta = contas.find(conta => conta.id === req.params.id);

  if (!conta) {
    return res.status(404).json({
      erro: 'Conta não encontrada.'
    });
  }

  return res.status(200).json(conta);
});
router.patch('/:id', (req, res) => {
  const conta = contas.find(conta => conta.id === req.params.id);

  if (!conta) {
    return res.status(404).json({
      erro: 'Conta não encontrada.'
    });
  }

  const { nome, saldoInicialCentavos } = req.body || {};

  if (nome === undefined && saldoInicialCentavos === undefined) {
    return res.status(400).json({
      erro: 'Informe nome ou saldo inicial para atualizar.'
    });
  }

  if (nome !== undefined &&
      (typeof nome !== 'string' || nome.trim() === '')) {
    return res.status(400).json({
      erro: 'O nome da conta deve ser um texto não vazio.'
    });
  }

  if (saldoInicialCentavos !== undefined &&
      !Number.isSafeInteger(saldoInicialCentavos)) {
    return res.status(400).json({
      erro: 'O saldo inicial deve ser um número inteiro em centavos.'
    });
  }

  if (nome !== undefined) {
    conta.nome = nome.trim();
  }

  if (saldoInicialCentavos !== undefined) {
    conta.saldoInicialCentavos = saldoInicialCentavos;
  }

  return res.status(200).json(conta);
});

module.exports = router;