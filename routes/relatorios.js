const express = require('express');
const autenticar = require('../middlewares/autenticar');
const { contas, lancamentos } = require('../dados/banco');
const router = express.Router();

router.use(autenticar);

router.get('/', (req, res) => {
    return res.status(200).json({
        mensagem: 'Rotas de relatórios funcionando.'
    });
});

module.exports = router;

router.get('/saldo/:contaId', (req, res) => {
    const conta = contas.find(conta =>
        conta.id === req.params.contaId &&
        conta.usuarioId === req.usuarioId
    );

    if (!conta) {
        return res.status(404).json({
            erro: 'Conta não encontrada.'
        });
    }

    const meusLancamentos = lancamentos.filter(lancamento =>
        lancamento.usuarioId === req.usuarioId &&
        lancamento.contaId === conta.id
    );

    let saldo = conta.saldoInicialCentavos;

    for (const lancamento of meusLancamentos) {
        if (lancamento.tipo === 'receita') {
            saldo += lancamento.valorCentavos;
        }

        if (lancamento.tipo === 'despesa') {
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

    if (!inicio || !fim) {
        return res.status(400).json({
            erro: 'Informe as datas de início e fim.'
        });
    }

    const meusLancamentos = lancamentos.filter(lancamento =>
        lancamento.usuarioId === req.usuarioId &&
        lancamento.data >= inicio &&
        lancamento.data <= fim
    );

    let receitasCentavos = 0;
    let despesasCentavos = 0;

    for (const lancamento of meusLancamentos) {
        if (lancamento.tipo === 'receita') {
            receitasCentavos += lancamento.valorCentavos;
        }

        if (lancamento.tipo === 'despesa') {
            despesasCentavos += lancamento.valorCentavos;
        }
    }

    return res.status(200).json({
        inicio,
        fim,
        receitasCentavos,
        despesasCentavos,
        saldoCentavos: receitasCentavos - despesasCentavos,
        lancamentos: meusLancamentos
    });
});
const {
    contas,
    lancamentos,
    categorias
} = require('../dados/banco');

router.get('/categorias', (req, res) => {
    const meusLancamentos = lancamentos.filter(
        lancamento => lancamento.usuarioId === req.usuarioId
    );

    const resultado = [];

    for (const categoria of categorias) {
        const lancamentosDaCategoria = meusLancamentos.filter(
            lancamento => lancamento.categoriaId === categoria.id
        );

        let totalCentavos = 0;

        for (const lancamento of lancamentosDaCategoria) {
            if (lancamento.tipo === 'despesa') {
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

    return res.status(200).json(resultado);
});
router.get('/mensal', (req, res) => {
    const meusLancamentos = lancamentos.filter(
        lancamento => lancamento.usuarioId === req.usuarioId
    );

    const meses = {};

    for (const lancamento of meusLancamentos) {
        const mes = lancamento.data.slice(0, 7);

        if (!meses[mes]) {
            meses[mes] = {
                receitasCentavos: 0,
                despesasCentavos: 0
            };
        }

        if (lancamento.tipo === 'receita') {
            meses[mes].receitasCentavos += lancamento.valorCentavos;
        }

        if (lancamento.tipo === 'despesa') {
            meses[mes].despesasCentavos += lancamento.valorCentavos;
        }
    }

    for (const mes of Object.values(meses)) {
        mes.saldoCentavos =
            mes.receitasCentavos - mes.despesasCentavos;
    }

    return res.status(200).json(meses);
});