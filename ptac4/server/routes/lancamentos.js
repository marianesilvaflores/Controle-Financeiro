const express = require('express');
const crypto = require('node:crypto');
const autenticar = require('../middlewares/autenticar');
const { contas, categorias, lancamentos } = require('../dados/banco');
const { enviarErro } = require('../utils/erros');

const router = express.Router();

router.use(autenticar);

const TIPOS = ['receita', 'despesa'];


function dataValida(data) {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }

  const objeto = new Date(`${data}T00:00:00Z`);

  return !Number.isNaN(objeto.getTime()) &&
    objeto.toISOString().slice(0, 10) === data;
}


function lerDados(corpo, usuarioId) {
  const {
    descricao, valorCentavos, tipo, data, contaId, categoriaId
  } = corpo || {};

  if (typeof descricao !== 'string' || descricao.trim() === '') {
    return { erro: 'A descrição é obrigatória.' };
  }

  if (!Number.isSafeInteger(valorCentavos) || valorCentavos <= 0) {
    return { erro: 'O valor deve ser um número inteiro positivo em centavos.' };
  }

  if (!TIPOS.includes(tipo)) {
    return { erro: 'O tipo deve ser "receita" ou "despesa".' };
  }

  if (!dataValida(data)) {
    return { erro: 'A data deve estar no formato AAAA-MM-DD.' };
  }

  const conta = contas.find(conta =>
    conta.id === contaId && conta.usuarioId === usuarioId
  );

  if (!conta) {
    return { erro: 'Conta não encontrada.' };
  }

  const categoria = categorias.find(categoria =>
    categoria.id === categoriaId && categoria.usuarioId === usuarioId
  );

  if (!categoria) {
    return { erro: 'Categoria não encontrada.' };
  }

  if (categoria.tipo !== tipo) {
    return {
      erro: `A categoria "${categoria.nome}" é de ${categoria.tipo}, ` +
        `mas o lançamento é de ${tipo}.`
    };
  }

  return {
    dados: {
      descricao: descricao.trim(),
      valorCentavos,
      tipo,
      data,
      contaId,
      categoriaId
    }
  };
}

function buscarLancamento(req) {
  return lancamentos.find(lancamento =>
    lancamento.id === req.params.id &&
    lancamento.usuarioId === req.usuarioId
  );
}


router.get('/', (req, res) => {
  const meus = lancamentos
    .filter(lancamento => lancamento.usuarioId === req.usuarioId)
    .sort((a, b) => b.data.localeCompare(a.data));

  return res.status(200).json({
    data: meus,
    meta: { total: meus.length }
  });
});


router.post('/', (req, res) => {
  const { erro, dados } = lerDados(req.body, req.usuarioId);

  if (erro) {
    return enviarErro(res, 400, 'validation', erro);
  }

  const lancamento = {
    id: crypto.randomUUID(),
    usuarioId: req.usuarioId,
    ...dados
  };

  lancamentos.push(lancamento);

  return res.status(201).json(lancamento);
});


router.get('/:id', (req, res) => {
  const lancamento = buscarLancamento(req);

  if (!lancamento) {
    return enviarErro(res, 404, 'not_found', 'Lançamento não encontrado.');
  }

  return res.status(200).json(lancamento);
});


router.put('/:id', (req, res) => {
  const lancamento = buscarLancamento(req);

  if (!lancamento) {
    return enviarErro(res, 404, 'not_found', 'Lançamento não encontrado.');
  }

  const { erro, dados } = lerDados(req.body, req.usuarioId);

  if (erro) {
    return enviarErro(res, 400, 'validation', erro);
  }

  Object.assign(lancamento, dados);

  return res.status(200).json(lancamento);
});

// Excluir
router.delete('/:id', (req, res) => {
  const lancamento = buscarLancamento(req);

  if (!lancamento) {
    return enviarErro(res, 404, 'not_found', 'Lançamento não encontrado.');
  }

  lancamentos.splice(lancamentos.indexOf(lancamento), 1);

  return res.status(204).send();
});

module.exports = router;