const crypto = require('node:crypto');
const { promisify } = require('node:util');
const usuariosModel = require('../models/usuariosModel');
const sessoesModel = require('../models/sessoesModel');

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

  const existentes = await usuariosModel.buscarTodas({
    email: emailNormalizado
  });

  if (existentes.length > 0) {
    throw gerarErro('Email já cadastrado.', 409);
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await gerarHash(senha, salt, 64);

  let usuario;

  try {
    usuario = await usuariosModel.inserir({
      id: crypto.randomUUID(),
      nome: nome.trim(),
      email: emailNormalizado,
      salt,
      senhaHash: hash.toString('hex')
    });
  } catch (erro) {
    if (erro.code === 11000) {
      throw gerarErro('Email já cadastrado.', 409);
    }

    throw erro;
  }

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

  const usuarios = await usuariosModel.buscarTodas({
    email: email.trim().toLowerCase()
  });

  const usuario = usuarios[0];

  if (!usuario) {
    throw gerarErro('Email ou senha incorretos.', 401);
  }

  const hash = await gerarHash(senha, usuario.salt, 64);
  const hashSalvo = Buffer.from(usuario.senhaHash, 'hex');

  if (
    hash.length !== hashSalvo.length ||
    !crypto.timingSafeEqual(hash, hashSalvo)
  ) {
    throw gerarErro('Email ou senha incorretos.', 401);
  }

  const token = crypto.randomBytes(32).toString('hex');

  await sessoesModel.inserir({
    id: token,
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