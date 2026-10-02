const express = require('express');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { usuarios } = require('../dados/banco');

const router = express.Router();
const gerarHash = promisify(crypto.scrypt);

router.post('/', async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body || {};

    if (typeof nome !== 'string' || nome.trim() === '') {
      return res.status(400).json({
        erro: 'O nome é obrigatório.'
      });
    }

    if (typeof email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        erro: 'Informe um email válido.'
      });
    }

    if (typeof senha !== 'string' ||
        senha.length < 8 || senha.length > 128) {
      return res.status(400).json({
        erro: 'A senha deve ter entre 8 e 128 caracteres.'
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await gerarHash(senha, salt, 64);

    if (usuarios.some(usuario => usuario.email === emailNormalizado)) {
      return res.status(409).json({
        erro: 'Email já cadastrado.'
      });
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

module.exports = router;