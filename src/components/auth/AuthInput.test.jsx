import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthInput from './AuthInput';

describe('AuthInput', () => {
  it('renders a labeled input and forwards typed value via onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AuthInput id="email" label="Email" type="email" value="" onChange={onChange} placeholder="name@example.com" />
    );

    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'name@example.com');

    await user.type(input, 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows an error message and marks the field invalid', () => {
    render(
      <AuthInput id="password" label="Password" value="" onChange={() => {}} error="Password is required." />
    );

    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no error UI when error is not set', () => {
    render(<AuthInput id="email" label="Email" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
  });
});
