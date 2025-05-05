
import { render, screen, fireEvent } from '../utils/test-utils'
import { Button } from '../components/ui/button'
import { vi } from 'vitest'

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  test('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button', { name: /click me/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('can be disabled', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeDisabled()
  })
})
