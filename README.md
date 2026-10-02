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