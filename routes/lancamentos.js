const express = require('express');
const router = express.Router();
const banco = require('../dados/banco');

const usuarioIdDe = (req) => req.usuarioId;
const TIPOS = ['receita', 'despesa'];

function proximoId(lista) {
  return lista.length ? Math.max(...lista.map((i) => i.id)) + 1 : 1;
}

function dataValida(data) {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const d = new Date(`${data}T00:00:00`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === data;
}

function validar(req) {
  const { contaId, categoriaId, descricao, valorCentavos, tipo, data } = req.body;
  const usuarioId = usuarioIdDe(req);

  if (!TIPOS.includes(tipo)) {
    return { status: 400, erro: 'O campo "tipo" deve ser "receita" ou "despesa".' };
  }
  if (typeof descricao !== 'string' || !descricao.trim()) {
    return { status: 400, erro: 'O campo "descricao" é obrigatório.' };
  }
  if (!Number.isInteger(valorCentavos) || valorCentavos <= 0) {
    return { status: 400, erro: '"valorCentavos" deve ser um inteiro positivo (em centavos).' };
  }
  if (!dataValida(data)) {
    return { status: 400, erro: '"data" deve estar no formato AAAA-MM-DD.' };
  }

  const conta = banco.contas.find(
    (c) => c.id === contaId && c.usuarioId === usuarioId
  );
  if (!conta) {
    return { status: 400, erro: 'Conta não encontrada ou não pertence ao usuário.' };
  }

  const categoria = banco.categorias.find(
    (c) => c.id === categoriaId && c.usuarioId === usuarioId
  );
  if (!categoria) {
    return { status: 400, erro: 'Categoria não encontrada ou não pertence ao usuário.' };
  }
  if (categoria.tipo !== tipo) {
    return { status: 400, erro: `Um lançamento de ${tipo} precisa de uma categoria de ${tipo}.` };
  }

  return {
    dados: { contaId, categoriaId, descricao: descricao.trim(), valorCentavos, tipo, data },
  };
}

router.post('/', (req, res) => {
  const { erro, status, dados } = validar(req);
  if (erro) return res.status(status).json({ erro });

  const lancamento = {
    id: proximoId(banco.lancamentos),
    usuarioId: usuarioIdDe(req),
    ...dados,
  };
  banco.lancamentos.push(lancamento);
  res.status(201).json(lancamento);
});

router.get('/', (req, res) => {
  const lista = banco.lancamentos.filter((l) => l.usuarioId === usuarioIdDe(req));
  res.json(lista);
});

router.get('/:id', (req, res) => {
  const lancamento = banco.lancamentos.find(
    (l) => l.id === Number(req.params.id) && l.usuarioId === usuarioIdDe(req)
  );
  if (!lancamento) {
    return res.status(404).json({ erro: 'Lançamento não encontrado.' });
  }
  res.json(lancamento);
});

router.put('/:id', (req, res) => {
  const lancamento = banco.lancamentos.find(
    (l) => l.id === Number(req.params.id) && l.usuarioId === usuarioIdDe(req)
  );
  if (!lancamento) {
    return res.status(404).json({ erro: 'Lançamento não encontrado.' });
  }

  const { erro, status, dados } = validar(req);
  if (erro) return res.status(status).json({ erro });

  Object.assign(lancamento, dados);
  res.json(lancamento);
});

router.delete('/:id', (req, res) => {
  const indice = banco.lancamentos.findIndex(
    (l) => l.id === Number(req.params.id) && l.usuarioId === usuarioIdDe(req)
  );
  if (indice === -1) {
    return res.status(404).json({ erro: 'Lançamento não encontrado.' });
  }

  banco.lancamentos.splice(indice, 1);
  res.status(204).send();
});

module.exports = router;

