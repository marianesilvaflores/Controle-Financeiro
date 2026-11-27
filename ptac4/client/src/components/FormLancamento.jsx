import { useState } from "react";
import {
  centavosParaReais,
  dataDeHoje,
} from "../utils/formatos";
import { validarLancamento } from "../utils/lancamentos";

function FormLancamento({ contas, categorias, editando, aoSalvar, aoCancelar }) {
  const [descricao, setDescricao] = useState(editando ? editando.descricao : "");
  const [valor, setValor] = useState(
    editando ? centavosParaReais(editando.valorCentavos) : ""
  );
  const [tipo, setTipo] = useState(editando ? editando.tipo : "despesa");
  const [data, setData] = useState(editando ? editando.data : dataDeHoje());
  const [contaId, setContaId] = useState(
    editando ? editando.contaId : contas[0] ? contas[0].id : ""
  );
  const [categoriaId, setCategoriaId] = useState(
    editando ? editando.categoriaId : ""
  );
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const categoriasDoTipo = categorias.filter((c) => c.tipo === tipo);

  function mudarTipo(novoTipo) {
    setTipo(novoTipo);
    setCategoriaId("");
  }

  function limpar() {
    setDescricao("");
    setValor("");
    setTipo("despesa");
    setData(dataDeHoje());
    setCategoriaId("");
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");

    
    let dados;
    try {
      dados = validarLancamento({
        descricao,
        valor,
        tipo,
        data,
        contaId,
        categoriaId,
      });
    } catch (e) {
      setErro(e.message);
      return;
    }

    setSalvando(true);
    try {
      await aoSalvar(dados);
      if (!editando) limpar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      <p>
        <label>
          Descrição<br />
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </label>
      </p>

      <p>
        <label>
          Valor (R$)<br />
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="25,50"
          />
        </label>
      </p>

      <p>
        <label>
          Tipo<br />
          <select value={tipo} onChange={(e) => mudarTipo(e.target.value)}>
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </select>
        </label>
      </p>

      <p>
        <label>
          Data<br />
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </label>
      </p>

      <p>
        <label>
          Conta<br />
          <select value={contaId} onChange={(e) => setContaId(e.target.value)}>
            <option value="">Escolha...</option>
            {contas.map((conta) => (
              <option key={conta.id} value={conta.id}>
                {conta.nome}
              </option>
            ))}
          </select>
        </label>
      </p>

      <p>
        <label>
          Categoria<br />
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            <option value="">Escolha...</option>
            {categoriasDoTipo.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </label>
      </p>

      {erro && <p className="erro">{erro}</p>}

      <div className="acoes">
        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar"}
        </button>
        {editando && (
          <button type="button" onClick={aoCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default FormLancamento;
