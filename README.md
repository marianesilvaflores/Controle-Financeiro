# Controle Financeiro

## Sobre o projeto

API de controle financeiro pessoal desenvolvida com Node.js e Express.

## Organização dos dados

- Usuários: pessoas que utilizam o sistema.
- Contas: onde o dinheiro fica, como carteira ou conta bancária.
- Categorias: classificam receitas e despesas, como salário e alimentação.
- Lançamentos: registram as entradas e saídas de dinheiro.

## Como executar

É necessário ter Node.js e npm instalados.

1. Execute `npm install` para instalar as dependências.
2. Execute `npm start` para iniciar o servidor.
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

Os dados ficam em memória.
Ao reiniciar o servidor, usuários, contas e sessões são apagados.
Os tokens de login têm validade de oito horas, desde que o servidor
não seja reiniciado.
## Relatórios

As funcionalidades de relatório permitem consultar informações financeiras do usuário autenticado.

### Saldo por conta

```http
GET /relatorios/saldo/:contaId

## Categorias

Todas as rotas exigem o header `Authorization: Bearer TOKEN`, com o token obtido em `POST /usuarios/login`. Cada usuário só acessa as próprias categorias.

Campos: `id`, `usuarioId`, `nome` e `tipo` (`receita` ou `despesa`).

| Método | Rota | Descrição | Respostas |
|--------|------|-----------|-----------|
| POST | /categorias | Cadastra uma categoria | 201, 400, 401 |
| GET | /categorias | Lista as categorias do usuário | 200, 401 |
| GET | /categorias/:id | Consulta uma categoria | 200, 401, 404 |
| PUT | /categorias/:id | Edita uma categoria | 200, 400, 401, 404, 409 |
| DELETE | /categorias/:id | Exclui uma categoria | 204, 401, 404, 409 |

Exemplo de corpo para cadastrar ou editar: `{ "nome": "Salário", "tipo": "receita" }`

Regras:
- `nome` é obrigatório e `tipo` deve ser `receita` ou `despesa` (400).
- Não é possível excluir uma categoria que tenha lançamentos (409).
- Não é possível mudar o `tipo` de uma categoria que tenha lançamentos (409).

## Lançamentos

Todas as rotas exigem o header `Authorization: Bearer TOKEN`, com o token obtido em `POST /usuarios/login`. Cada usuário só acessa os próprios lançamentos.

Campos: `id`, `usuarioId`, `contaId`, `categoriaId`, `descricao`, `valorCentavos`, `tipo` (`receita` ou `despesa`) e `data` (formato `AAAA-MM-DD`).

| Método | Rota | Descrição | Respostas |
|--------|------|-----------|-----------|
| POST | /lancamentos | Cadastra um lançamento | 201, 400, 401 |
| GET | /lancamentos | Lista os lançamentos do usuário | 200, 401 |
| GET | /lancamentos/:id | Consulta um lançamento | 200, 401, 404 |
| PUT | /lancamentos/:id | Edita um lançamento | 200, 400, 401, 404 |
| DELETE | /lancamentos/:id | Exclui um lançamento | 204, 401, 404 |

Exemplo de corpo para cadastrar ou editar:

{
  "contaId": "ID_DA_CONTA",
  "categoriaId": 1,
  "descricao": "Salário de outubro",
  "valorCentavos": 250000,
  "tipo": "receita",
  "data": "2026-10-05"
}

Regras:
- A conta e a categoria devem existir e pertencer ao usuário (400).
- Receita só pode usar categoria de receita, e despesa só categoria de despesa (400).
- `valorCentavos` deve ser um número inteiro positivo, em centavos (400).
- `descricao` é obrigatória e `data` deve estar no formato `AAAA-MM-DD` (400).

## Categorias

Todas as rotas exigem o header `Authorization: Bearer TOKEN`, com o token obtido em `POST /usuarios/login`. Cada usuário só acessa as próprias categorias.

Campos: `id`, `usuarioId`, `nome` e `tipo` (`receita` ou `despesa`).

| Método | Rota | Descrição | Respostas |
|--------|------|-----------|-----------|
| POST | /categorias | Cadastra uma categoria | 201, 400, 401 |
| GET | /categorias | Lista as categorias do usuário | 200, 401 |
| GET | /categorias/:id | Consulta uma categoria | 200, 401, 404 |
| PUT | /categorias/:id | Edita uma categoria | 200, 400, 401, 404, 409 |
| DELETE | /categorias/:id | Exclui uma categoria | 204, 401, 404, 409 |

Exemplo de corpo para cadastrar ou editar: `{ "nome": "Salário", "tipo": "receita" }`

Regras:
- `nome` é obrigatório e `tipo` deve ser `receita` ou `despesa` (400).
- Não é possível excluir uma categoria que tenha lançamentos (409).
- Não é possível mudar o `tipo` de uma categoria que tenha lançamentos (409).

## Lançamentos

Todas as rotas exigem o header `Authorization: Bearer TOKEN`, com o token obtido em `POST /usuarios/login`. Cada usuário só acessa os próprios lançamentos.

Campos: `id`, `usuarioId`, `contaId`, `categoriaId`, `descricao`, `valorCentavos`, `tipo` (`receita` ou `despesa`) e `data` (formato `AAAA-MM-DD`).

| Método | Rota | Descrição | Respostas |
|--------|------|-----------|-----------|
| POST | /lancamentos | Cadastra um lançamento | 201, 400, 401 |
| GET | /lancamentos | Lista os lançamentos do usuário | 200, 401 |
| GET | /lancamentos/:id | Consulta um lançamento | 200, 401, 404 |
| PUT | /lancamentos/:id | Edita um lançamento | 200, 400, 401, 404 |
| DELETE | /lancamentos/:id | Exclui um lançamento | 204, 401, 404 |

Exemplo de corpo para cadastrar ou editar:

{
  "contaId": "ID_DA_CONTA",
  "categoriaId": 1,
  "descricao": "Salário de outubro",
  "valorCentavos": 250000,
  "tipo": "receita",
  "data": "2026-10-05"
}

Regras:
- A conta e a categoria devem existir e pertencer ao usuário (400).
- Receita só pode usar categoria de receita, e despesa só categoria de despesa (400).
- `valorCentavos` deve ser um número inteiro positivo, em centavos (400).
- `descricao` é obrigatória e `data` deve estar no formato `AAAA-MM-DD` (400).