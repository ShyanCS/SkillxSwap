import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBanner from './ErrorBanner';

describe('ErrorBanner', () => {
  it('renders nothing when there is no message', () => {
    const { container } = render(<ErrorBanner message="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the message with alert semantics', () => {
    render(<ErrorBanner message="Something failed" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something failed');
  });

  it('applies error styling by default and success styling for the success tone', () => {
    const { rerender } = render(<ErrorBanner message="m" />);
    expect(screen.getByTestId('error-banner').className).toContain('bg-red-50');

    rerender(<ErrorBanner message="m" tone="success" />);
    expect(screen.getByTestId('error-banner').className).toContain('bg-green-50');
  });

  it('falls back to error styling for an unknown tone', () => {
    render(<ErrorBanner message="m" tone="sparkly" />);
    expect(screen.getByTestId('error-banner').className).toContain('bg-red-50');
  });

  it('shows a dismiss control only when onDismiss is provided', () => {
    const { rerender } = render(<ErrorBanner message="m" />);
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();

    const onDismiss = vi.fn();
    rerender(<ErrorBanner message="m" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
