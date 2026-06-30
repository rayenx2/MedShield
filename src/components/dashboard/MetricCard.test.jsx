import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard';

describe('MetricCard', () => {
  it('renders title, value, and hint', () => {
    render(<MetricCard title="Documents" value="4" hint="Total stored documents" />);
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Total stored documents')).toBeInTheDocument();
  });
});
