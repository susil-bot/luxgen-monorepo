import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavBar } from '../NavBar/NavBar';

describe('30', () => { it('NavBar guest Login', () => { render(<NavBar user={undefined} />); expect(screen.getAllByText('Login').length).toBeGreaterThan(0); expect(screen.getByText('Sign Up')).toBeInTheDocument(); }); });
