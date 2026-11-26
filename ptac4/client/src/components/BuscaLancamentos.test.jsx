import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BuscaLancamentos from './BuscaLancamentos'

describe('BuscaLancamentos', () => {
  it('avisa o que foi digitado', () => {
    let digitado = ''

    render(
      <BuscaLancamentos
        valor=""
        aoMudar={(texto) => {
          digitado = texto
        }}
      />
    )

    fireEvent.change(screen.getByLabelText(/Buscar/), {
      target: { value: 'almo' },
    })

    expect(digitado).toBe('almo')
  })
})
