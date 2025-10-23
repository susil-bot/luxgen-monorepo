import { InputWithLabelProps } from './InputWithLabel';
import { defaultTheme } from '../theme';

export const inputWithLabelFixtures = {
  default: {
    tenantTheme: defaultTheme,
    label: 'Input Label',
    type: 'text' as const,
    placeholder: 'Enter text...',
    value: '',
  } as InputWithLabelProps,
  
  withValue: {
    tenantTheme: defaultTheme,
    label: 'Input Label',
    type: 'text' as const,
    placeholder: 'Enter text...',
    value: 'Sample text',
  } as InputWithLabelProps,
  
  withError: {
    tenantTheme: defaultTheme,
    label: 'Input Label',
    type: 'text' as const,
    placeholder: 'Enter text...',
    value: '',
    error: 'This field is required',
  } as InputWithLabelProps,
  
  withHelperText: {
    tenantTheme: defaultTheme,
    label: 'Input Label',
    type: 'text' as const,
    placeholder: 'Enter text...',
    value: '',
    helperText: 'Please enter your text here',
  } as InputWithLabelProps,
  
  required: {
    tenantTheme: defaultTheme,
    label: 'Required Input',
    type: 'text' as const,
    placeholder: 'Enter text...',
    value: '',
    required: true,
  } as InputWithLabelProps,
  
  disabled: {
    tenantTheme: defaultTheme,
    label: 'Disabled Input',
    type: 'text' as const,
    placeholder: 'Enter text...',
    value: 'Disabled value',
    disabled: true,
  } as InputWithLabelProps,
  
  email: {
    tenantTheme: defaultTheme,
    label: 'Email Address',
    type: 'email' as const,
    placeholder: 'Enter your email...',
    value: '',
    required: true,
  } as InputWithLabelProps,
  
  password: {
    tenantTheme: defaultTheme,
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter your password...',
    value: '',
    required: true,
  } as InputWithLabelProps,
  
  small: {
    tenantTheme: defaultTheme,
    label: 'Small Input',
    type: 'text' as const,
    placeholder: 'Enter text...',
    value: '',
    size: 'sm' as const,
  } as InputWithLabelProps,
  
  large: {
    tenantTheme: defaultTheme,
    label: 'Large Input',
    type: 'text' as const,
    placeholder: 'Enter text...',
    value: '',
    size: 'lg' as const,
  } as InputWithLabelProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
        border: '#D1D5DB',
      },
    },
    label: 'Custom Themed Input',
    type: 'text' as const,
    placeholder: 'Enter text...',
    value: '',
  } as InputWithLabelProps,
};
