# Controle Financeiro

## Sobre o projeto

API de controle financeiro pessoal desenvolvida com Node.js e Express.

## Organização dos dados

- Usuários: pessoas que utilizam o sistema.
- Contas: onde o dinheiro fica, como carteira ou conta bancária.
- Categorias: classificam receitas e despesas, como salário e alimentação.
- Lançamentos: registram as entradas e saídas de dinheiro.

## Como executar

É necessário ter Node.js, npm e Docker instalados.

1. Execute `npm install` para instalar as dependências.
2. Copie `.env.example` para `.env`.
3. Execute `npm run dev` para iniciar o MongoDB e a API.
4. Para executar sem monitorar alterações: `npm run db:up` e depois `npm start`.
3. A API estará disponível na porta 3000.

## Usuários e login

| Método | Rota | Função |
|---|---|---|
| POST | /usuarios | Cadastrar usuário |
| POST | /usuarios/login | Fazer login e receber um token |

Para cadastrar um usuário, envie um JSON com:
- nome
- email
- senha de 8 a 128 caracteres

Para fazer login, envie email e senha.

O email não pode ser cadastrado duas vezes.
A senha é armazenada como hash e não aparece nas respostas.

## Contas

Todas as rotas de contas exigem o cabeçalho:

Authorization: Bearer SEU_TOKEN

| Método | Rota | Função |
|---|---|---|
| GET | /contas | Listar as próprias contas |
| GET | /contas/:id | Consultar uma conta pelo ID |
| POST | /contas | Cadastrar uma conta |
| PATCH | /contas/:id | Atualizar nome ou saldo inicial |
| DELETE | /contas/:id | Excluir uma conta |

Para cadastrar uma conta, envie:
- nome: texto obrigatório
- saldoInicialCentavos: número inteiro em centavos

Exemplo: 10000 representa R$ 100,00.

O usuário da conta é identificado pelo token.
Cada usuário só pode consultar, editar e excluir suas próprias contas.

## Respostas da API

- 200: consulta, edição ou login realizado.
- 201: cadastro realizado.
- 204: exclusão realizada, sem corpo na resposta.
- 400: dados inválidos.
- 401: autenticação ausente, inválida ou expirada.
- 404: conta inexistente ou pertencente a outro usuário.
- 409: email já cadastrado.

## Armazenamento atual

Os dados ficam no MongoDB, no volume Docker controle-financeiro-data.
Reiniciar a API preserva os registros e as sessões. Os tokens valem oito horas.
O comando npm run db:reset apaga o container e o volume com os dados.

## Relatórios

As funcionalidades de relatório permitem consultar informações financeiras do usuário autenticado.

### Saldo por conta

```http
GET /relatorios/saldo/:contaId
```
### Lancamentos no MongoDB

- POST /lancamentos: cadastra uma receita ou despesa.
- GET /lancamentos: lista apenas os lancamentos do usuario autenticado.
- Envie o cabecalho Authorization com Bearer e o token recebido no login.

Exemplo do corpo do cadastro (substitua os IDs por uma conta e uma categoria suas):

```json
{
  "descricao": "Compra no mercado",
  "tipo": "despesa",
  "valorCentavos": 1250,
  "data": "2026-11-26",
  "contaId": "id-da-conta",
  "categoriaId": "id-da-categoria"
}
```

O valor deve ser um inteiro positivo em centavos e a data deve ser valida,
no formato AAAA-MM-DD. A categoria precisa ter o mesmo tipo do lancamento.
Conta e categoria devem pertencer ao usuario autenticado.

O Model possui inserir, buscarTodas, buscarPorId, atualizar e remover.
As rotas tambem oferecem GET /lancamentos/:id, PATCH /lancamentos/:id e DELETE /lancamentos/:id.
No PATCH, envie apenas os campos que deseja alterar.

## Estrutura do backend PTAS

O fluxo e routes -> controllers -> services -> models.
A conexao MongoDB fica em src/config/mongodb.js.
Os Models de usuarios, sessoes, contas, categorias e lancamentos exportam
somente inserir, buscarTodas, buscarPorId, atualizar e remover.
Os relatorios usam os Models dessas entidades; nao existe uma colecao de relatorios.

## Relatorios disponiveis

Todos exigem o token de login e usam apenas os dados do proprio usuario.

- GET /relatorios/saldo/:contaId
- GET /relatorios/extrato?inicio=2026-11-01&fim=2026-11-30
- GET /relatorios/categorias
- GET /relatorios/mensal

## Verificacao

Com o MongoDB iniciado, execute npm test na raiz.
O teste usa o banco controle_financeiro_testes e remove somente os registros que criou.
Verifica cadastro, consulta, alteracao, exclusao, validacoes, isolamento por usuario
e os quatro relatorios usando a API e o MongoDB.

O projeto PTAC esta na pasta ptac4 e possui instrucoes proprias.
