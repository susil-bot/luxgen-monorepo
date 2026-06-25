import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card/Card';

describe('28', () => { it('Card', () => { render(<Card>Card Content</Card>); expect(screen.getByText('Card Content')).toBeInTheDocument(); }); });
