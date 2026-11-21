const express = require('express');
const usuariosController = require('../controllers/usuariosController');

const router = express.Router();

router.post('/', usuariosController.cadastrar);
router.post('/login', usuariosController.login);

module.exports = router;