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


router.get('/:id', (req, res) => {
  const categoria = banco.categorias.find(
    (c) => c.id === Number(req.params.id) && c.usuarioId === usuarioIdDe(req)
  );
  if (!categoria) {
    return res.status(404).json({ erro: 'Categoria não encontrada.' });
  }
  res.json(categoria);
});


router.put('/:id', (req, res) => {
  const categoria = banco.categorias.find(
    (c) => c.id === Number(req.params.id) && c.usuarioId === usuarioIdDe(req)
  );
  if (!categoria) {
    return res.status(404).json({ erro: 'Categoria não encontrada.' });
  }

  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });


  if (req.body.tipo !== categoria.tipo) {
    const emUso = banco.lancamentos.some((l) => l.categoriaId === categoria.id);
    if (emUso) {
      return res.status(409).json({
        erro: 'Não é possível mudar o tipo: existem lançamentos usando esta categoria.',
      });
    }
  }

  categoria.nome = req.body.nome.trim();
  categoria.tipo = req.body.tipo;
  res.json(categoria);
});


router.delete('/:id', (req, res) => {
  const indice = banco.categorias.findIndex(
    (c) => c.id === Number(req.params.id) && c.usuarioId === usuarioIdDe(req)
  );
  if (indice === -1) {
    return res.status(404).json({ erro: 'Categoria não encontrada.' });
  }

  const emUso = banco.lancamentos.some(
    (l) => l.categoriaId === banco.categorias[indice].id
  );
  if (emUso) {
    return res.status(409).json({
      erro: 'Categoria em uso por lançamentos; não pode ser excluída.',
    });
  }

  banco.categorias.splice(indice, 1);
  res.status(204).send();
});

module.exports = router;