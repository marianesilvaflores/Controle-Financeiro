const express = require('express');
const crypto = require('node:crypto');
const autenticar = require('../middlewares/autenticar');
const { categorias } = require('../dados/banco');
const { enviarErro } = require('../utils/erros');

const router = express.Router();

router.use(autenticar);

const TIPOS = ['receita', 'despesa'];


router.post('/', (req, res) => {
  const { nome, tipo } = req.body || {};

  if (typeof nome !== 'string' || nome.trim() === '') {
    return enviarErro(res, 400, 'validation', 'O campo "nome" é obrigatório.');
  }

  if (!TIPOS.includes(tipo)) {
    return enviarErro(res, 400, 'validation',
      'O campo "tipo" deve ser "receita" ou "despesa".');
  }

  const categoria = {
    id: crypto.randomUUID(),
    usuarioId: req.usuarioId,
    nome: nome.trim(),
    tipo
  };

  categorias.push(categoria);

  return res.status(201).json(categoria);
});


router.get('/', (req, res) => {
  const minhasCategorias = categorias.filter(categoria =>
    categoria.usuarioId === req.usuarioId
  );

  return res.status(200).json({
    data: minhasCategorias,
    meta: { total: minhasCategorias.length }
  });
});

module.exports = router;