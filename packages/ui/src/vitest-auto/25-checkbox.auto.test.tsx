import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Checkbox } from '../Checkbox/Checkbox';

describe('25', () => { it('Checkbox', () => { render(<Checkbox label="Accept" checked={false} />); expect(screen.getByRole('checkbox')).toBeInTheDocument(); }); });
