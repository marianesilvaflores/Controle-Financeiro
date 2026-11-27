const express = require('express');
const autenticar = require('../middlewares/autenticar');
const lancamentosController = require('../controllers/lancamentosController');

const router = express.Router();
router.use(autenticar);
router.get('/', lancamentosController.listar);
router.post('/', lancamentosController.criar);

router.get('/:id', lancamentosController.buscarPorId);
router.patch('/:id', lancamentosController.atualizar);
router.delete('/:id', lancamentosController.excluir);

module.exports = router;
