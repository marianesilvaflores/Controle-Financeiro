import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CartaoLancamento from './CartaoLancamento'

const lancamento = {
  id: '1',
  descricao: 'Almoço',
  valorCentavos: 2550,
  tipo: 'despesa',
  data: '2026-11-24',
}

describe('CartaoLancamento', () => {
  it('mostra os dados do lançamento', () => {
    render(
      <CartaoLancamento
        lancamento={lancamento}
        nomeConta="Carteira"
        nomeCategoria="Alimentação"
      />
    )

    expect(screen.getByText('Almoço')).toBeInTheDocument()
    expect(screen.getByText('Categoria: Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Data: 24/11/2026')).toBeInTheDocument()
  })

  it('chama aoEditar ao clicar em Editar', () => {
    let editado = null

    render(
      <CartaoLancamento
        lancamento={lancamento}
        nomeConta="Carteira"
        nomeCategoria="Alimentação"
        aoEditar={(item) => {
          editado = item
        }}
      />
    )

    fireEvent.click(screen.getByText('Editar'))

    expect(editado).toEqual(lancamento)
  })
})
