// Teste automático da API. Rode com: node teste.js
// (o servidor precisa estar ligado em outro terminal com: npm start)

const BASE = 'http://localhost:3000/api/v1';
let token = '';
let falhas = 0;

async function chamar(metodo, caminho, corpo) {
  const resposta = await fetch(BASE + caminho, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: corpo ? JSON.stringify(corpo) : undefined
  });

  const texto = await resposta.text();
  let dados = null;

  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch {
    dados = texto;
  }

  return { status: resposta.status, dados };
}

function conferir(nome, ok, detalhe) {
  if (ok) {
    console.log(`✅ ${nome}`);
  } else {
    falhas++;
    console.log(`❌ ${nome}`);
    console.log('   Recebi:', JSON.stringify(detalhe));
  }
}

async function main() {
  const email = `teste${Date.now()}@email.com`;

  // 0. Sem token deve ser barrado
  let r = await chamar('GET', '/contas');
  conferir('Sem login a API barra (401)', r.status === 401, r);

  // 1. Cadastrar usuário
  r = await chamar('POST', '/usuarios', {
    nome: 'Ana', email, senha: '12345678'
  });
  conferir('1. Cadastrar usuário (201)', r.status === 201, r);

  // 2. Login
  r = await chamar('POST', '/usuarios/login', { email, senha: '12345678' });
  conferir('2. Login (200 + token)', r.status === 200 && !!r.dados?.token, r);
  token = r.dados?.token || '';

  // 3. Criar conta
  r = await chamar('POST', '/contas', {
    nome: 'Carteira', saldoInicialCentavos: 10000
  });
  conferir('3. Criar conta (201)', r.status === 201, r);
  const contaId = r.dados?.id;

  // 4. Listar contas
  r = await chamar('GET', '/contas');
  conferir('4. Listar contas (data + meta)',
    r.status === 200 && Array.isArray(r.dados?.data) && r.dados?.meta?.total === 1, r);

  // 5. Criar categoria
  r = await chamar('POST', '/categorias', { nome: 'Alimentação', tipo: 'despesa' });
  conferir('5. Criar categoria (201)', r.status === 201, r);
  const categoriaId = r.dados?.id;

  // 6. Listar categorias
  r = await chamar('GET', '/categorias');
  conferir('6. Listar categorias (data + meta)',
    r.status === 200 && r.dados?.meta?.total === 1, r);

  // 7. Criar lançamento
  r = await chamar('POST', '/lancamentos', {
    descricao: 'Almoço',
    valorCentavos: 2500,
    tipo: 'despesa',
    data: '2026-11-24',
    contaId,
    categoriaId
  });
  conferir('7. Criar lançamento (201)', r.status === 201, r);
  const lancamentoId = r.dados?.id;

  // 7b. Validação: lançamento inválido deve dar 400 com { type, message }
  r = await chamar('POST', '/lancamentos', { descricao: '' });
  conferir('7b. Lançamento inválido dá 400 { type, message }',
    r.status === 400 && r.dados?.type === 'validation' && !!r.dados?.message, r);

  // 8. Listar lançamentos
  r = await chamar('GET', '/lancamentos');
  conferir('8. Listar lançamentos (data + meta)',
    r.status === 200 && r.dados?.meta?.total === 1, r);

  // 9. Editar lançamento (PUT)
  r = await chamar('PUT', `/lancamentos/${lancamentoId}`, {
    descricao: 'Almoço com amigos',
    valorCentavos: 3500,
    tipo: 'despesa',
    data: '2026-11-24',
    contaId,
    categoriaId
  });
  conferir('9. Editar lançamento (200, valor 3500)',
    r.status === 200 && r.dados?.valorCentavos === 3500, r);

  // 10. Saldo: 10000 - 3500 = 6500
  r = await chamar('GET', `/relatorios/saldo/${contaId}`);
  conferir('10. Saldo da conta = 6500',
    r.status === 200 && r.dados?.saldoCentavos === 6500, r);

  // 11. Extrato
  r = await chamar('GET', '/relatorios/extrato?inicio=2026-11-01&fim=2026-11-30');
  conferir('11. Extrato do mês (despesas 3500)',
    r.status === 200 && r.dados?.despesasCentavos === 3500, r);

  // 12. Despesas por categoria
  r = await chamar('GET', '/relatorios/categorias');
  conferir('12. Despesas por categoria',
    r.status === 200 && r.dados?.data?.[0]?.totalCentavos === 3500, r);

  // 13. Resumo mensal
  r = await chamar('GET', '/relatorios/mensal');
  conferir('13. Resumo mensal (2026-11)',
    r.status === 200 && r.dados?.['2026-11']?.saldoCentavos === -3500, r);

  // 13b. Conta com lançamentos não pode ser excluída
  r = await chamar('DELETE', `/contas/${contaId}`);
  conferir('13b. Conta com lançamentos não exclui (409)', r.status === 409, r);

  // 14. Excluir lançamento
  r = await chamar('DELETE', `/lancamentos/${lancamentoId}`);
  conferir('14. Excluir lançamento (204)', r.status === 204, r);

  // 14b. Depois de excluído, deve dar 404
  r = await chamar('GET', `/lancamentos/${lancamentoId}`);
  conferir('14b. Lançamento excluído dá 404', r.status === 404, r);

  console.log('');
  if (falhas === 0) {
    console.log('🎉 TUDO CERTO! A API está funcionando.');
  } else {
    console.log(`⚠️  ${falhas} teste(s) falharam. Copie tudo isto e me envie.`);
  }
}

main().catch((erro) => {
  console.log('❌ Não consegui falar com a API.');
  console.log('   O servidor está ligado? (npm start no outro terminal)');
  console.log('   Erro:', erro.message);
});
