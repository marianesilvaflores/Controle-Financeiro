const express = require('express');
const autenticar = require('../middlewares/autenticar');
const relatoriosController = require('../controllers/relatoriosController');

const router = express.Router();

router.use(autenticar);

router.get('/', relatoriosController.status);
router.get('/saldo/:contaId', relatoriosController.saldoPorConta);
router.get('/extrato', relatoriosController.extrato);
router.get('/categorias', relatoriosController.porCategoria);
router.get('/mensal', relatoriosController.mensal);

module.exports = router;