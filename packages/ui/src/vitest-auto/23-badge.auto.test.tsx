import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge/Badge';

describe('23', () => { it('Badge children', () => { render(<Badge>Auto Badge</Badge>); expect(screen.getByText('Auto Badge')).toBeInTheDocument(); }); });
