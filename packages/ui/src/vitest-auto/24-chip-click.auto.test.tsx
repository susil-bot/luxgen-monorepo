import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Chip } from '../Chip/Chip';

describe('24', () => { it('Chip onClick button role', () => { const onClick = vi.fn(); render(<Chip label="Clickable" onClick={onClick} />); const button = screen.getByRole('button'); fireEvent.click(button); expect(onClick).toHaveBeenCalledTimes(1); }); });
