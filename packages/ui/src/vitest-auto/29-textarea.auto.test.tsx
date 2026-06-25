import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextArea } from '../TextArea/TextArea';

describe('29', () => { it('TextArea', () => { render(<TextArea value="hello" onChange={() => {}} />); expect(screen.getByDisplayValue('hello')).toBeInTheDocument(); }); });
