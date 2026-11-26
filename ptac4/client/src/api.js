const baseUrl = "/api/v1";

let token = null;

export function setToken(novoToken) {
  token = novoToken;
}

const MENSAGENS_POR_STATUS = {
  400: "Dados inválidos",
  401: "Sessão expirada ou login inválido",
  404: "Item não encontrado",
  409: "Registro já cadastrado",
  500: "Erro no servidor. A API está ligada?",
};

async function requisicao(caminho, opcoes = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${baseUrl}${caminho}`, { ...opcoes, headers });
  } catch (erro) {
    
    if (erro.name === "AbortError") throw erro;
    throw new Error("Não foi possível conectar à API. Ela está ligada?");
  }

  if (!response.ok) {
    let mensagem = MENSAGENS_POR_STATUS[response.status] || `Erro ${response.status}`;
    try {
      
      const corpo = await response.json();
      if (corpo.message) mensagem = corpo.message;
    } catch {
      
    }
    const erro = new Error(mensagem);
    erro.status = response.status;
    throw erro;
  }

  if (response.status === 204) return null;
  return response.json();
}

export function apiLogin(email, senha) {
  return requisicao("/usuarios/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export function apiGet(caminho, signal) {
  return requisicao(caminho, { signal });
}

export async function apiListar(caminho, signal) {
  const resposta = await requisicao(caminho, { signal });
  return resposta.data;
}

export function apiPost(caminho, dados) {
  return requisicao(caminho, { method: "POST", body: JSON.stringify(dados) });
}

export function apiPut(caminho, dados) {
  return requisicao(caminho, { method: "PUT", body: JSON.stringify(dados) });
}

export function apiDelete(caminho) {
  return requisicao(caminho, { method: "DELETE" });
}
