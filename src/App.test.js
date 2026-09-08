import { render, screen } from '@testing-library/react';
import App from './App';

test('renders manufacturing operations splash screen', () => {
  render(<App />);
  const titleElement = screen.getByText(/KajButton/i);
  expect(titleElement).toBeInTheDocument();
});
