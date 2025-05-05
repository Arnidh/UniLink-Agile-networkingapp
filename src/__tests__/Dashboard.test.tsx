
import { render, screen } from '../utils/test-utils'
import Dashboard from '../pages/Dashboard'
import { vi } from 'vitest'

// Mock the useAuth hook since Dashboard likely depends on it
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test-user-id' },
    profile: { role: 'student', name: 'Test User' }
  })
}))

describe('Dashboard Component', () => {
  test('renders welcome message', () => {
    render(<Dashboard />)
    expect(screen.getByText(/welcome/i, { exact: false })).toBeInTheDocument()
  })

  test('has navigation links', () => {
    render(<Dashboard />)
    // Check if key navigation elements exist
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
