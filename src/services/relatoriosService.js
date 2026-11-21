const relatoriosModel = require('../models/relatoriosModel');
const contasModel = require('../models/contasModel');
const categoriasModel = require('../models/categoriasModel');

function gerarErro(mensagem, status) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

function calcularTotais(lancamentos) {
  let receitasCentavos = 0;
  let despesasCentavos = 0;

  for (const lancamento of lancamentos) {
    if (lancamento.tipo === 'receita') {
      receitasCentavos += lancamento.valorCentavos;
    }

    if (lancamento.tipo === 'despesa') {
      despesasCentavos += lancamento.valorCentavos;
    }
  }

  return {
    receitasCentavos,
    despesasCentavos,
    saldoCentavos: receitasCentavos - despesasCentavos
  };
}

function saldoPorConta(contaId, usuarioId) {
  const conta = contasModel.buscarPorId(contaId, usuarioId);

  if (!conta) {
    throw gerarErro('Conta não encontrada.', 404);
  }

  const lancamentos = relatoriosModel
    .listarLancamentos(usuarioId)
    .filter(lancamento => lancamento.contaId === conta.id);

  const totais = calcularTotais(lancamentos);

  return {
    contaId: conta.id,
    saldoCentavos: conta.saldoInicialCentavos + totais.saldoCentavos
  };
}

function validarData(valor) {
  if (
    typeof valor !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    return false;
  }

  const data = new Date(`${valor}T00:00:00.000Z`);

  return !Number.isNaN(data.getTime()) &&
    data.toISOString().slice(0, 10) === valor;
}

function extrato(usuarioId, filtros) {
  const { inicio, fim } = filtros || {};

  if (!validarData(inicio) || !validarData(fim)) {
    throw gerarErro(
      'Informe datas válidas de início e fim no formato AAAA-MM-DD.',
      400
    );
  }

  if (inicio > fim) {
    throw gerarErro('A data inicial deve ser anterior ou igual à final.', 400);
  }

  const lancamentos = relatoriosModel
    .listarLancamentos(usuarioId)
    .filter(lancamento =>
      lancamento.data >= inicio && lancamento.data <= fim
    );

  return {
    inicio,
    fim,
    ...calcularTotais(lancamentos),
    lancamentos
  };
}

function porCategoria(usuarioId) {
  const lancamentos = relatoriosModel.listarLancamentos(usuarioId);
  const categorias = categoriasModel.listarPorUsuario(usuarioId);
  const resultado = [];

  for (const categoria of categorias) {
    const despesas = lancamentos.filter(lancamento =>
      lancamento.categoriaId === categoria.id &&
      lancamento.tipo === 'despesa'
    );

    const totalCentavos = calcularTotais(despesas).despesasCentavos;

    if (totalCentavos > 0) {
      resultado.push({
        categoriaId: categoria.id,
        categoria: categoria.nome,
        totalCentavos
      });
    }
  }

  return resultado;
}

function mensal(usuarioId) {
  const lancamentos = relatoriosModel.listarLancamentos(usuarioId);
  const grupos = new Map();

  for (const lancamento of lancamentos) {
    const mes = lancamento.data.slice(0, 7);

    if (!grupos.has(mes)) {
      grupos.set(mes, []);
    }

    grupos.get(mes).push(lancamento);
  }

  const resultado = {};

  for (const [mes, lancamentosDoMes] of grupos) {
    resultado[mes] = calcularTotais(lancamentosDoMes);
  }

  return resultado;
}

module.exports = {
  saldoPorConta,
  extrato,
  porCategoria,
  mensal
};