const express = require('express');
const autenticar = require('../middlewares/autenticar');
const lancamentosController = require('../controllers/lancamentosController');

const router = express.Router();
router.use(autenticar);
router.get('/', lancamentosController.listar);
router.post('/', lancamentosController.criar);

module.exports = router;
