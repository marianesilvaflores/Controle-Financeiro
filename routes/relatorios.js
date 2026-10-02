const express = require('express');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();

router.use(autenticar);

router.get('/', (req, res) => {
    return res.status(200).json({
        mensagem: 'Rotas de relatórios funcionando.'
    });
});

module.exports = router;