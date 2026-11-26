import { useEffect, useState } from "react";
import { apiDelete, apiListar, apiPost, apiPut } from "../api";
import { filtrarLancamentos } from "../utils/lancamentos";
import BuscaLancamentos from "./BuscaLancamentos";
import FormLancamento from "./FormLancamento";
import ListaLancamentos from "./ListaLancamentos";

const CATEGORIAS_INICIAIS = [
  { nome: "Salário", tipo: "receita" },
  { nome: "Alimentação", tipo: "despesa" },
  { nome: "Transporte", tipo: "despesa" },
  { nome: "Lazer", tipo: "despesa" },
];

function Painel({ aoSair }) {
  const [lancamentos, setLancamentos] = useState([]);
  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [preparando, setPreparando] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      try {
        const [listaLancamentos, listaCategorias, listaContas] =
          await Promise.all([
            apiListar("/lancamentos", controller.signal),
            apiListar("/categorias", controller.signal),
            apiListar("/contas", controller.signal),
          ]);
        setLancamentos(listaLancamentos);
        setCategorias(listaCategorias);
        setContas(listaContas);
      } catch (e) {
        if (e.name === "AbortError") return;
        if (e.status === 401) {
          aoSair();
          return;
        }
        setErro(e.message);
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    carregar();

    return () => controller.abort();
  }, [aoSair]);

  async function salvar(dados) {
    setAviso("");
    try {
      if (editando) {
        const atualizado = await apiPut(`/lancamentos/${editando.id}`, dados);
        setLancamentos(
          lancamentos.map((l) => (l.id === atualizado.id ? atualizado : l))
        );
        setEditando(null);
      } else {
        const criado = await apiPost("/lancamentos", dados);
        setLancamentos([criado, ...lancamentos]);
      }
    } catch (e) {
      if (e.status === 401) aoSair();
      throw e;
    }
  }

  async function excluir(lancamento) {
    if (!window.confirm(`Excluir "${lancamento.descricao}"?`)) return;

    setAviso("");
    try {
      await apiDelete(`/lancamentos/${lancamento.id}`);
      setLancamentos(lancamentos.filter((l) => l.id !== lancamento.id));
      if (editando && editando.id === lancamento.id) setEditando(null);
    } catch (e) {
      if (e.status === 401) {
        aoSair();
        return;
      }
      setAviso(e.message);
    }
  }

  async function prepararInicio() {
    setAviso("");
    setPreparando(true);
    try {
      if (contas.length === 0) {
        const conta = await apiPost("/contas", {
          nome: "Carteira",
          saldoInicialCentavos: 0,
        });
        setContas([conta]);
      }

      if (categorias.length === 0) {
        const criadas = [];
        for (const modelo of CATEGORIAS_INICIAIS) {
          criadas.push(await apiPost("/categorias", modelo));
        }
        setCategorias(criadas);
      }
    } catch (e) {
      if (e.status === 401) {
        aoSair();
        return;
      }
      setAviso(e.message);
    } finally {
      setPreparando(false);
    }
  }

  const filtrados = filtrarLancamentos(lancamentos, busca);

  const precisaPreparar =
    !carregando && !erro && (contas.length === 0 || categorias.length === 0);
  const mostrarTela = !carregando && !erro && !precisaPreparar;

  return (
    <div className="app">
      <header className="cabecalho">
        <h1>Controle Financeiro</h1>
        <button type="button" onClick={aoSair}>
          Sair
        </button>
      </header>

      {carregando && <p className="estado">Carregando...</p>}
      {erro && <p className="estado erro">{erro}</p>}
      {aviso && <p className="estado erro">{aviso}</p>}

      {precisaPreparar && (
        <section className="regiao">
          <h2>Primeiros passos</h2>
          <p>
            Para cadastrar lançamentos você precisa de uma conta e de
            categorias.
          </p>
          <button type="button" onClick={prepararInicio} disabled={preparando}>
            {preparando ? "Criando..." : "Criar conta e categorias padrão"}
          </button>
        </section>
      )}

      {mostrarTela && (
        <>
          <section className="regiao">
            <h2>{editando ? "Editar lançamento" : "Novo lançamento"}</h2>
            <FormLancamento
              key={editando ? editando.id : "novo"}
              contas={contas}
              categorias={categorias}
              editando={editando}
              aoSalvar={salvar}
              aoCancelar={() => setEditando(null)}
            />
          </section>

          <section className="regiao">
            <h2>Lançamentos</h2>
            <BuscaLancamentos valor={busca} aoMudar={setBusca} />
            <ListaLancamentos
              lancamentos={filtrados}
              total={lancamentos.length}
              busca={busca}
              contas={contas}
              categorias={categorias}
              aoEditar={setEditando}
              aoExcluir={excluir}
            />
          </section>
        </>
      )}
    </div>
  );
}

export default Painel;
