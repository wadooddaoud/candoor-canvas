import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('manual career canvas flow', () => {
  it('diagnoses, proposes, accepts, matches, and stages a handoff', () => {
    render(<App />)
    const initialScore = Number(screen.getByText('/100').previousSibling?.textContent)
    fireEvent.click(screen.getAllByRole('button', { name: /diagnose/i })[0])
    expect(screen.getByText(/Quantify adoption/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /draft rewrite/i }))
    expect(screen.getByText(/Agent proposal/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /accept rewrite/i }))
    expect(screen.getByText(/cutting model deployment time by 42%/i)).toBeInTheDocument()
    expect(Number(screen.getByText('/100').previousSibling?.textContent)).toBeGreaterThan(initialScore)
    fireEvent.click(screen.getByRole('button', { name: /match advisors/i }))
    expect(screen.getByRole('button', { name: /^selected$/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /stage advisor brief/i }))
    expect(screen.getByRole('dialog')).toHaveTextContent(/no booking created/i)
    expect(screen.getByRole('dialog')).toHaveTextContent(/Maya Chen/i)
  })
})
