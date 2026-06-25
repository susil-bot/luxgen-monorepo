import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Switch } from '../Switch/Switch';

describe('26', () => { it('Switch', () => { render(<Switch label="Enable" checked={false} />); expect(screen.getByRole('checkbox')).toBeInTheDocument(); }); });
