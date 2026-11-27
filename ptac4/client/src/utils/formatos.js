// Funções puras para dinheiro e datas (fáceis de testar).

// "25,50" -> 2550. Lança erro se o texto não for um valor válido.
export function reaisParaCentavos(texto) {
  const limpo = String(texto ?? "").trim().replace(",", ".");

  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) {
    throw new Error("Informe um valor válido, como 25,50.");
  }

  const [inteiros, decimais = ""] = limpo.split(".");
  return Number(inteiros) * 100 + Number(decimais.padEnd(2, "0"));
}

// 2550 -> "25,50" (para preencher o campo ao editar)
export function centavosParaReais(centavos) {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

// 2550 -> "R$ 25,50"
export function formatarValor(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// "2026-11-24" -> "24/11/2026"
export function formatarData(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Data de hoje no formato do campo <input type="date">: AAAA-MM-DD
export function dataDeHoje() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}
