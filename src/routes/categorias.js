const express = require('express');
const router = express.Router();
const banco = require('../dados/banco');

banco.categorias = banco.categorias || [];
banco.lancamentos = banco.lancamentos || [];

const usuarioIdDe = (req) => req.usuarioId;
const TIPOS = ['receita', 'despesa'];

function proximoId(lista) {
  return lista.length ? Math.max(...lista.map((i) => i.id)) + 1 : 1;
}

function validar({ nome, tipo }) {
  if (typeof nome !== 'string' || !nome.trim()) {
    return 'O campo "nome" é obrigatório.';
  }
  if (!TIPOS.includes(tipo)) {
    return 'O campo "tipo" deve ser "receita" ou "despesa".';
  }
  return null;
}

module.exports = router;

router.post('/', (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });

  const categoria = {
    id: proximoId(banco.categorias),
    usuarioId: usuarioIdDe(req),
    nome: req.body.nome.trim(),
    tipo: req.body.tipo,
  };

  banco.categorias.push(categoria);
  res.status(201).json(categoria);
});

router.get('/', (req, res) => {
  const lista = banco.categorias.filter(
    (c) => c.usuarioId === usuarioIdDe(req)
  );
  res.json(lista);
});