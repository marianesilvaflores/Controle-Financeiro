const crypto = require('node:crypto');
const { promisify } = require('node:util');
const usuariosModel = require('../models/usuariosModel');

const gerarHash = promisify(crypto.scrypt);

function gerarErro(mensagem, status) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

async function cadastrar(dados) {
  const { nome, email, senha } = dados || {};

  if (typeof nome !== 'string' || nome.trim() === '') {
    throw gerarErro('O nome é obrigatório.', 400);
  }

  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw gerarErro('Informe um email válido.', 400);
  }

  if (
    typeof senha !== 'string' ||
    senha.length < 8 ||
    senha.length > 128
  ) {
    throw gerarErro(
      'A senha deve ter entre 8 e 128 caracteres.',
      400
    );
  }

  const emailNormalizado = email.trim().toLowerCase();
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await gerarHash(senha, salt, 64);

  if (usuariosModel.buscarPorEmail(emailNormalizado)) {
    throw gerarErro('Email já cadastrado.', 409);
  }

  const usuario = usuariosModel.criar({
    id: crypto.randomUUID(),
    nome: nome.trim(),
    email: emailNormalizado,
    salt,
    senhaHash: hash.toString('hex')
  });

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email
  };
}

async function login(dados) {
  const { email, senha } = dados || {};

  if (
    typeof email !== 'string' ||
    typeof senha !== 'string' ||
    senha.length < 8 ||
    senha.length > 128
  ) {
    throw gerarErro('Informe email e senha válidos.', 400);
  }

  const usuario = usuariosModel.buscarPorEmail(
    email.trim().toLowerCase()
  );

  if (!usuario) {
    throw gerarErro('Email ou senha incorretos.', 401);
  }

  const hash = await gerarHash(senha, usuario.salt, 64);
  const hashSalvo = Buffer.from(usuario.senhaHash, 'hex');

  if (!crypto.timingSafeEqual(hash, hashSalvo)) {
    throw gerarErro('Email ou senha incorretos.', 401);
  }

  const token = crypto.randomBytes(32).toString('hex');

  usuariosModel.criarSessao({
    token,
    usuarioId: usuario.id,
    expiraEm: Date.now() + 8 * 60 * 60 * 1000
  });

  return {
    mensagem: 'Login realizado.',
    token
  };
}

module.exports = {
  cadastrar,
  login
};