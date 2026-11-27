import { reaisParaCentavos } from "./formatos";

const TIPOS = ["receita", "despesa"];

// Confere os campos do formulário. Se algo estiver errado, lança um Error
// com uma mensagem amigável. Se estiver tudo certo, devolve o objeto
// pronto para enviar à API (com o valor em centavos).
export function validarLancamento({
  descricao,
  valor,
  tipo,
  data,
  contaId,
  categoriaId,
}) {
  if (!descricao || descricao.trim() === "") {
    throw new Error("Informe a descrição.");
  }

  const valorCentavos = reaisParaCentavos(valor);

  if (valorCentavos <= 0) {
    throw new Error("O valor deve ser maior que zero.");
  }

  if (!TIPOS.includes(tipo)) {
    throw new Error("Escolha receita ou despesa.");
  }

  if (!data) {
    throw new Error("Informe a data.");
  }

  if (!contaId) {
    throw new Error("Escolha uma conta.");
  }

  if (!categoriaId) {
    throw new Error("Escolha uma categoria.");
  }

  return {
    descricao: descricao.trim(),
    valorCentavos,
    tipo,
    data,
    contaId,
    categoriaId,
  };
}

// Busca no cliente: a descrição contém o termo (sem diferenciar maiúsculas).
export function filtrarLancamentos(lista, termo) {
  const busca = (termo ?? "").trim().toLowerCase();

  if (busca === "") {
    return lista;
  }

  return lista.filter((lancamento) =>
    lancamento.descricao.toLowerCase().includes(busca)
  );
}
