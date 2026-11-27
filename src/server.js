const { conectar, desconectar } = require('./config/mongodb');
const app = require('./app');

const PORTA = process.env.PORT || 3000;

async function iniciar() {
  try {
    await conectar();
    console.log('MongoDB conectado');

    app.listen(PORTA, () => {
      console.log(`Servidor rodando na porta ${PORTA}`);
    });
  } catch (erro) {
    console.error('Erro ao iniciar a API:', erro.message);
    await desconectar();
    process.exitCode = 1;
  }
}

iniciar();