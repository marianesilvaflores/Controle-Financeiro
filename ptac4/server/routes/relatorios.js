const express = require('express');
const autenticar = require('../middlewares/autenticar');
const { contas, lancamentos, categorias } = require('../dados/banco');
const { enviarErro } = require('../utils/erros');

const router = express.Router();

router.use(autenticar);

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function meusLancamentosDe(req) {
  return lancamentos.filter(lancamento =>
    lancamento.usuarioId === req.usuarioId
  );
}

router.get('/', (req, res) => {
  return res.status(200).json({
    mensagem: 'Rotas de relatórios funcionando.'
  });
});


router.get('/saldo/:contaId', (req, res) => {
  const conta = contas.find(conta =>
    conta.id === req.params.contaId &&
    conta.usuarioId === req.usuarioId
  );

  if (!conta) {
    return enviarErro(res, 404, 'not_found', 'Conta não encontrada.');
  }

  let saldo = conta.saldoInicialCentavos;

  for (const lancamento of meusLancamentosDe(req)) {
    if (lancamento.contaId !== conta.id) continue;

    if (lancamento.tipo === 'receita') {
      saldo += lancamento.valorCentavos;
    } else if (lancamento.tipo === 'despesa') {
      saldo -= lancamento.valorCentavos;
    }
  }

  return res.status(200).json({
    contaId: conta.id,
    saldoCentavos: saldo
  });
});


router.get('/extrato', (req, res) => {
  const { inicio, fim } = req.query;

  if (!DATA_REGEX.test(inicio || '') || !DATA_REGEX.test(fim || '')) {
    return enviarErro(res, 400, 'validation',
      'Informe inicio e fim no formato AAAA-MM-DD.');
  }

  const doPeriodo = meusLancamentosDe(req).filter(lancamento =>
    lancamento.data >= inicio && lancamento.data <= fim
  );

  let receitasCentavos = 0;
  let despesasCentavos = 0;

  for (const lancamento of doPeriodo) {
    if (lancamento.tipo === 'receita') {
      receitasCentavos += lancamento.valorCentavos;
    } else if (lancamento.tipo === 'despesa') {
      despesasCentavos += lancamento.valorCentavos;
    }
  }

  return res.status(200).json({
    inicio,
    fim,
    receitasCentavos,
    despesasCentavos,
    saldoCentavos: receitasCentavos - despesasCentavos,
    lancamentos: doPeriodo
  });
});


router.get('/categorias', (req, res) => {
  const meus = meusLancamentosDe(req);
  const minhasCategorias = categorias.filter(categoria =>
    categoria.usuarioId === req.usuarioId
  );

  const resultado = [];

  for (const categoria of minhasCategorias) {
    let totalCentavos = 0;

    for (const lancamento of meus) {
      if (lancamento.categoriaId === categoria.id &&
          lancamento.tipo === 'despesa') {
        totalCentavos += lancamento.valorCentavos;
      }
    }

    if (totalCentavos > 0) {
      resultado.push({
        categoriaId: categoria.id,
        categoria: categoria.nome,
        totalCentavos
      });
    }
  }

  return res.status(200).json({
    data: resultado,
    meta: { total: resultado.length }
  });
});


router.get('/mensal', (req, res) => {
  const meses = {};

  for (const lancamento of meusLancamentosDe(req)) {
    const mes = lancamento.data.slice(0, 7);

    if (!meses[mes]) {
      meses[mes] = { receitasCentavos: 0, despesasCentavos: 0 };
    }

    if (lancamento.tipo === 'receita') {
      meses[mes].receitasCentavos += lancamento.valorCentavos;
    } else if (lancamento.tipo === 'despesa') {
      meses[mes].despesasCentavos += lancamento.valorCentavos;
    }
  }

  const ordenado = {};

  for (const mes of Object.keys(meses).sort()) {
    ordenado[mes] = {
      ...meses[mes],
      saldoCentavos: meses[mes].receitasCentavos - meses[mes].despesasCentavos
    };
  }

  return res.status(200).json(ordenado);
});

module.exports = router;