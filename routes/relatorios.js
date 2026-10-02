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