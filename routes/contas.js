const express = require('express');
const crypto = require('node:crypto');
const autenticar = require('../middlewares/autenticar');
const { contas } = require('../dados/banco');

const router = express.Router();

router.use(autenticar);

// Listar somente as contas do usuário autenticado.
router.get('/', (req, res) => {
  const minhasContas = contas.filter(conta =>
    conta.usuarioId === req.usuarioId
  );

  return res.status(200).json(minhasContas);
});

// Cadastrar uma conta vinculada ao usuário autenticado.
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
    usuarioId: req.usuarioId,
    nome: nome.trim(),
    saldoInicialCentavos
  };

  contas.push(conta);

  return res.status(201).json(conta);
});

// Consultar uma conta do próprio usuário.
router.get('/:id', (req, res) => {
  const conta = contas.find(conta =>
    conta.id === req.params.id &&
    conta.usuarioId === req.usuarioId
  );

  if (!conta) {
    return res.status(404).json({
      erro: 'Conta não encontrada.'
    });
  }

  return res.status(200).json(conta);
});

// Atualizar uma conta do próprio usuário.
router.patch('/:id', (req, res) => {
  const conta = contas.find(conta =>
    conta.id === req.params.id &&
    conta.usuarioId === req.usuarioId
  );

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

  if (
    nome !== undefined &&
    (typeof nome !== 'string' || nome.trim() === '')
  ) {
    return res.status(400).json({
      erro: 'O nome da conta deve ser um texto não vazio.'
    });
  }

  if (
    saldoInicialCentavos !== undefined &&
    !Number.isSafeInteger(saldoInicialCentavos)
  ) {
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

// Excluir uma conta do próprio usuário.
router.delete('/:id', (req, res) => {
  const indice = contas.findIndex(conta =>
    conta.id === req.params.id &&
    conta.usuarioId === req.usuarioId
  );

  if (indice === -1) {
    return res.status(404).json({
      erro: 'Conta não encontrada.'
    });
  }

  contas.splice(indice, 1);

  return res.status(204).send();
});

module.exports = router;