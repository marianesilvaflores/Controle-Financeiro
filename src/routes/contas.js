const express = require('express');
const autenticar = require('../middlewares/autenticar');
const contasController = require('../controllers/contasController');

const router = express.Router();

router.use(autenticar);

router.get('/', contasController.listar);
router.get('/:id', contasController.buscarPorId);
router.post('/', contasController.criar);
router.patch('/:id', contasController.atualizar);
router.delete('/:id', contasController.excluir);

module.exports = router;