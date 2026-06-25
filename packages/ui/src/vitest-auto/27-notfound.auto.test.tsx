import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotFound } from '../NotFound/NotFound';

describe('27', () => { it('NotFound', () => { render(<NotFound />); expect(screen.getByText('Page Not Found')).toBeInTheDocument(); }); });
