import CartaoLancamento from "./CartaoLancamento";

function nomeDe(lista, id) {
  const item = lista.find((i) => i.id === id);
  return item ? item.nome : "—";
}

function ListaLancamentos({
  lancamentos,
  total,
  busca,
  contas,
  categorias,
  aoEditar,
  aoExcluir,
}) {
  if (total === 0) {
    return <p className="estado">Nenhum lançamento cadastrado ainda.</p>;
  }

  if (lancamentos.length === 0) {
    return (
      <p className="estado">Nenhum lançamento encontrado para "{busca}".</p>
    );
  }

  return (
    <ul className="lista">
      {lancamentos.map((lancamento) => (
        <li key={lancamento.id}>
          <CartaoLancamento
            lancamento={lancamento}
            nomeConta={nomeDe(contas, lancamento.contaId)}
            nomeCategoria={nomeDe(categorias, lancamento.categoriaId)}
            aoEditar={aoEditar}
            aoExcluir={aoExcluir}
          />
        </li>
      ))}
    </ul>
  );
}

export default ListaLancamentos;
