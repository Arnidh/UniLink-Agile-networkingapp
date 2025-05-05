
import { render, screen } from '../utils/test-utils'
import Header from '../components/layout/Header'

describe('Header Component', () => {
  test('renders header with navigation', () => {
    render(<Header />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  test('contains logo', () => {
    render(<Header />)
    const logoElement = screen.getByAltText(/logo/i) || screen.getByRole('img')
    expect(logoElement).toBeInTheDocument()
  })
})
