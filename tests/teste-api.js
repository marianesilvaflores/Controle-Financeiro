const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
process.env.MONGODB_DB = 'controle_financeiro_testes';
const db = require('../src/config/mongodb');
const app = require('../src/app');
(async () => {
 await db.conectar();
 const usuarioId = randomUUID(), outroId = randomUUID();
 const token = randomUUID(), outroToken = randomUUID();
 const contaId = randomUUID(), categoriaId = randomUUID();
 const banco = db.obterBanco();
 const server = app.listen(0, '127.0.0.1');
 await new Promise(resolve => server.once('listening', resolve));
 const base = 'http://127.0.0.1:' + server.address().port;
 async function request(method, path, dados, sessao = token) {
  return fetch(base + path, {method, headers:{'Content-Type':'application/json', Authorization:'Bearer '+sessao}, body:dados === undefined ? undefined : JSON.stringify(dados)});
 }
 try {
  await banco.collection('sessoes').insertMany([{id:token, usuarioId, expiraEm:Date.now()+60000},{id:outroToken, usuarioId:outroId, expiraEm:Date.now()+60000}]);
  await banco.collection('contas').insertOne({id:contaId, usuarioId, nome:'Teste temporario', saldoInicialCentavos:10000});
  await banco.collection('categorias').insertOne({id:categoriaId, usuarioId, nome:'Teste temporario', tipo:'despesa'});
  const dados = {descricao:'Compra teste', tipo:'despesa', valorCentavos:1250, data:'2026-11-26', contaId, categoriaId};
  const post = await request('POST','/lancamentos',dados);
  assert.equal(post.status,201, await post.clone().text());
  const criado = await post.json(), path = '/lancamentos/'+criado.id;
  assert.equal((await request('GET',path)).status,200);
  assert.equal((await request('GET',path,undefined,outroToken)).status,404);
  assert.equal((await request('PATCH',path,{valorCentavos:500},outroToken)).status,404);
  assert.equal((await request('DELETE',path,undefined,outroToken)).status,404);
  for (const invalido of [{},{valorCentavos:0},{data:'2026-02-30'},{tipo:'receita'},{contaId:{$ne:null}}]) {
   assert.equal((await request('PATCH',path,invalido)).status,400);
  }
  const alterado = await request('PATCH',path,{valorCentavos:2000,usuarioId:outroId,id:'alterado'});
  assert.equal(alterado.status,200, await alterado.clone().text());
  const resultado = await alterado.json();
  assert.equal(resultado.id,criado.id);
  assert.equal(resultado.usuarioId,usuarioId);
  assert.equal(resultado.valorCentavos,2000);
  assert.equal((await banco.collection('lancamentos').findOne({id:criado.id})).valorCentavos,2000);
  const receitaCategoriaId = randomUUID();
  await banco.collection('categorias').insertOne({id:receitaCategoriaId, usuarioId, nome:'Receitas teste', tipo:'receita'});
  const receita = await request('POST','/lancamentos',{...dados, tipo:'receita', categoriaId:receitaCategoriaId, valorCentavos:5000});
  assert.equal(receita.status,201);
  async function relatorio(caminho, sessao = token) {
   const resposta = await request('GET',caminho,undefined,sessao);
   assert.equal(resposta.status,200,await resposta.clone().text());
   return resposta.json();
  }
  const saldo = await relatorio('/relatorios/saldo/'+contaId);
  assert.equal(saldo.saldoCentavos,13000);
  const extrato = await relatorio('/relatorios/extrato?inicio=2026-11-01&fim=2026-11-30');
  assert.equal(extrato.receitasCentavos,5000);
  assert.equal(extrato.despesasCentavos,2000);
  assert.equal(extrato.saldoCentavos,3000);
  assert.equal(extrato.lancamentos.length,2);
  const vazio = await relatorio('/relatorios/extrato?inicio=2026-10-01&fim=2026-10-31');
  assert.equal(vazio.lancamentos.length,0);
  const categorias = await relatorio('/relatorios/categorias');
  assert.equal(categorias.length,1);
  assert.equal(categorias[0].totalCentavos,2000);
  const mensal = await relatorio('/relatorios/mensal');
  assert.equal(mensal['2026-11'].saldoCentavos,3000);
  assert.deepEqual(await relatorio('/relatorios/mensal',outroToken),{});
  assert.deepEqual(await relatorio('/relatorios/categorias',outroToken),[]);
  assert.equal((await request('GET','/relatorios/saldo/'+contaId,undefined,outroToken)).status,404);
  for(const periodo of ['','?inicio=2026-02-30&fim=2026-03-01','?inicio=2026-11-30&fim=2026-11-01']) {
   assert.equal((await request('GET','/relatorios/extrato'+periodo)).status,400);
  }
  console.log('OK: saldo, extrato, categorias, mensal e isolamento dos relatorios');
  const excluido = await request('DELETE',path);
  assert.equal(excluido.status,204);
  assert.equal(await excluido.text(),'');
  assert.equal((await request('GET',path)).status,404);
  assert.equal((await request('DELETE',path)).status,404);
  assert.equal(await banco.collection('lancamentos').findOne({id:criado.id}),null);
  console.log('OK: CRUD de lancamentos, validacoes e isolamento por usuario');
 } finally {
  for(const nome of ['lancamentos','categorias','contas','sessoes']) await banco.collection(nome).deleteMany({usuarioId:{$in:[usuarioId,outroId]}});
  await new Promise(resolve => server.close(resolve));
  await db.desconectar();
 }
})().catch(e => {console.error(e);process.exitCode=1;});
