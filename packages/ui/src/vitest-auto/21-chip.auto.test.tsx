import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Chip } from '../Chip/Chip';

describe('21', () => {
  it('Chip', () => {
    render(<Chip label="Auto Chip" />);
    expect(screen.getByText('Auto Chip')).toBeInTheDocument();
  });
});
