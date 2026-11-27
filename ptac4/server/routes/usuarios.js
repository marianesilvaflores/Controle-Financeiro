const express = require('express');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { usuarios, sessoes } = require('../dados/banco');
const { enviarErro } = require('../utils/erros');

const router = express.Router();
const gerarHash = promisify(crypto.scrypt);


router.post('/', async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body || {};

    if (typeof nome !== 'string' || nome.trim() === '') {
      return enviarErro(res, 400, 'validation', 'O nome é obrigatório.');
    }

    if (typeof email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return enviarErro(res, 400, 'validation', 'Informe um email válido.');
    }

    if (typeof senha !== 'string' ||
        senha.length < 8 || senha.length > 128) {
      return enviarErro(res, 400, 'validation',
        'A senha deve ter entre 8 e 128 caracteres.');
    }

    const emailNormalizado = email.trim().toLowerCase();
    const emailJaExiste = () =>
      usuarios.some(usuario => usuario.email === emailNormalizado);

    
    if (emailJaExiste()) {
      return enviarErro(res, 409, 'conflict', 'Email já cadastrado.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await gerarHash(senha, salt, 64);

    
    if (emailJaExiste()) {
      return enviarErro(res, 409, 'conflict', 'Email já cadastrado.');
    }

    const usuario = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      email: emailNormalizado,
      salt,
      senhaHash: hash.toString('hex')
    };

    usuarios.push(usuario);

    return res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    });
  } catch (erro) {
    next(erro);
  }
});


router.post('/login', async (req, res, next) => {
  try {
    const { email, senha } = req.body || {};

    if (typeof email !== 'string' ||
        typeof senha !== 'string' ||
        senha.length < 8 || senha.length > 128) {
      return enviarErro(res, 400, 'validation', 'Informe email e senha válidos.');
    }

    const usuario = usuarios.find(usuario =>
      usuario.email === email.trim().toLowerCase()
    );

    if (!usuario) {
      return enviarErro(res, 401, 'unauthorized', 'Email ou senha incorretos.');
    }

    const hash = await gerarHash(senha, usuario.salt, 64);
    const hashSalvo = Buffer.from(usuario.senhaHash, 'hex');

    if (!crypto.timingSafeEqual(hash, hashSalvo)) {
      return enviarErro(res, 401, 'unauthorized', 'Email ou senha incorretos.');
    }

    
    for (let i = sessoes.length - 1; i >= 0; i--) {
      if (sessoes[i].expiraEm <= Date.now()) {
        sessoes.splice(i, 1);
      }
    }

    const token = crypto.randomBytes(32).toString('hex');

    sessoes.push({
      token,
      usuarioId: usuario.id,
      expiraEm: Date.now() + 8 * 60 * 60 * 1000
    });

    return res.status(200).json({
      mensagem: 'Login realizado.',
      token
    });
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;