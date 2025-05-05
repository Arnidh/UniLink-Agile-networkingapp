import { render } from '@testing-library/react'
import Dashboard from '../pages/Dashboard'

test('renders Home page', () => {
  const { getByText } = render(<Dashboard />)
  expect(getByText('Welcome')).toBeInTheDocument()
})
