require('dotenv').config();

const { MongoClient } = require('mongodb');

let cliente;
let banco;

async function conectar() {
  if (banco) return banco;

  const uri = process.env.MONGODB_URI;
  const nomeBanco = process.env.MONGODB_DB;

  if (!uri || !nomeBanco) {
    throw new Error('Configure MONGODB_URI e MONGODB_DB no .env.');
  }

  cliente = new MongoClient(uri);
  await cliente.connect();

  banco = cliente.db(nomeBanco);
  await banco.command({ ping: 1 });

  return banco;
}

function obterBanco() {
  if (!banco) {
    throw new Error('O MongoDB ainda não foi conectado.');
  }

  return banco;
}

async function desconectar() {
  if (cliente) await cliente.close();
  cliente = undefined;
  banco = undefined;
}

module.exports = { conectar, obterBanco, desconectar };