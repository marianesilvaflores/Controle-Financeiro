import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FormLancamento from './FormLancamento'

const contas = [{ id: 'c1', nome: 'Carteira' }]
const categorias = [{ id: 'k1', nome: 'Alimentação', tipo: 'despesa' }]

describe('FormLancamento', () => {
  it('mostra mensagem de validação ao enviar vazio', () => {
    let chamou = false

    render(
      <FormLancamento
        contas={contas}
        categorias={categorias}
        editando={null}
        aoSalvar={() => {
          chamou = true
        }}
      />
    )

    fireEvent.click(screen.getByText('Cadastrar'))

    expect(screen.getByText('Informe a descrição.')).toBeInTheDocument()
    expect(chamou).toBe(false)
  })

  it('envia os dados quando o formulário está preenchido', async () => {
    let enviado = null

    render(
      <FormLancamento
        contas={contas}
        categorias={categorias}
        editando={null}
        aoSalvar={(dados) => {
          enviado = dados
        }}
      />
    )

    fireEvent.change(screen.getByLabelText(/Descrição/), {
      target: { value: 'Almoço' },
    })
    fireEvent.change(screen.getByLabelText(/Valor/), {
      target: { value: '25,50' },
    })
    fireEvent.change(screen.getByLabelText(/Categoria/), {
      target: { value: 'k1' },
    })
    fireEvent.click(screen.getByText('Cadastrar'))

    await waitFor(() => expect(enviado).not.toBeNull())
    expect(enviado.valorCentavos).toBe(2550)
  })
})
