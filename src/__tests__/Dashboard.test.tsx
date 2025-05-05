
import { render, screen } from '../utils/test-utils'
import Dashboard from '../pages/Dashboard'

describe('Dashboard Component', () => {
  test('renders welcome message', () => {
    render(<Dashboard />)
    expect(screen.getByText('Welcome')).toBeInTheDocument()
  })

  test('has navigation links', () => {
    render(<Dashboard />)
    // Check if key navigation elements exist
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
