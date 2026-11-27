function BuscaLancamentos({ valor, aoMudar }) {
  return (
    <div className="busca">
      <label htmlFor="busca">Buscar por descrição</label>
      <input
        id="busca"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder="Ex.: almoço"
      />
    </div>
  )
}

export default BuscaLancamentos