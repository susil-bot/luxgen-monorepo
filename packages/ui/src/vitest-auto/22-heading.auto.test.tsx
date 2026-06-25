import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading } from '../Heading/Heading';

describe('22', () => { it('Heading text prop', () => { render(<Heading level={2} text="Auto Heading" />); expect(screen.getByText('Auto Heading')).toBeInTheDocument(); }); });
