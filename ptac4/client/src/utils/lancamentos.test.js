import { describe, it, expect } from 'vitest'
import { validarLancamento, filtrarLancamentos } from './lancamentos'

const dados = {
  descricao: 'Almoço',
  valor: '25,50',
  tipo: 'despesa',
  data: '2026-11-24',
  contaId: 'c1',
  categoriaId: 'k1',
}

describe('validarLancamento', () => {
  it('devolve o valor em centavos', () => {
    const resultado = validarLancamento(dados)
    expect(resultado.valorCentavos).toBe(2550)
  })

  it('lança erro quando a descrição está vazia', () => {
    expect(() => validarLancamento({ ...dados, descricao: '' })).toThrow(
      'Informe a descrição.'
    )
  })

  it('lança erro quando falta a categoria', () => {
    expect(() => validarLancamento({ ...dados, categoriaId: '' })).toThrow(
      'Escolha uma categoria.'
    )
  })
})

describe('filtrarLancamentos', () => {
  const lista = [
    { id: 1, descricao: 'Almoço' },
    { id: 2, descricao: 'Salário' },
  ]

  it('filtra pela descrição', () => {
    expect(filtrarLancamentos(lista, 'alm')).toEqual([
      { id: 1, descricao: 'Almoço' },
    ])
  })

  it('devolve tudo quando a busca está vazia', () => {
    expect(filtrarLancamentos(lista, '')).toHaveLength(2)
  })
})
