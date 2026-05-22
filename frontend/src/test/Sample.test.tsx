import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

/**
 * Componente mínimo de ejemplo para que el test tenga algo que renderizar.
 * Cuando tengas componentes reales, importa el tuyo y borra esto.
 */
function Saludo({ nombre }: { nombre: string }) {
  return <h1>Hola, {nombre}!</h1>
}

describe('Saludo', () => {
  it('renderiza el nombre correctamente', () => {
    render(<Saludo nombre="Mundo" />)
    expect(screen.getByText('Hola, Mundo!')).toBeInTheDocument()
  })

  it('el heading existe en el DOM', () => {
    render(<Saludo nombre="Test" />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading.textContent).toContain('Test')
  })
})