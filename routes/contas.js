const express = require('express');

const router = express.Router();

const contas = [];

router.get('/', (req, res) => {
  res.status(200).json(contas);
});

module.exports = router;