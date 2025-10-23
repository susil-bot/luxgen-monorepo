import { TextAreaProps } from './TextArea';
import { defaultTheme } from '../theme';

export const textAreaFixtures = {
  default: {
    tenantTheme: defaultTheme,
    value: '',
    placeholder: 'Enter your message...',
    rows: 4,
  } as TextAreaProps,
  
  withLabel: {
    tenantTheme: defaultTheme,
    value: '',
    placeholder: 'Enter your message...',
    rows: 4,
    label: 'Message',
    required: true,
  } as TextAreaProps,
  
  withError: {
    tenantTheme: defaultTheme,
    value: '',
    placeholder: 'Enter your message...',
    rows: 4,
    label: 'Message',
    error: 'This field is required',
  } as TextAreaProps,
  
  withHelperText: {
    tenantTheme: defaultTheme,
    value: '',
    placeholder: 'Enter your message...',
    rows: 4,
    label: 'Message',
    helperText: 'Please provide a detailed description',
  } as TextAreaProps,
  
  withValue: {
    tenantTheme: defaultTheme,
    value: 'This is a sample message with some content.',
    placeholder: 'Enter your message...',
    rows: 4,
    label: 'Message',
  } as TextAreaProps,
  
  disabled: {
    tenantTheme: defaultTheme,
    value: 'This textarea is disabled',
    placeholder: 'Enter your message...',
    rows: 4,
    label: 'Message',
    disabled: true,
  } as TextAreaProps,
  
  readOnly: {
    tenantTheme: defaultTheme,
    value: 'This textarea is read-only',
    placeholder: 'Enter your message...',
    rows: 4,
    label: 'Message',
    readOnly: true,
  } as TextAreaProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
        border: '#D1D5DB',
      },
    },
    value: '',
    placeholder: 'Enter your message...',
    rows: 4,
    label: 'Message',
  } as TextAreaProps,
  
  withMaxLength: {
    tenantTheme: defaultTheme,
    value: '',
    placeholder: 'Enter your message...',
    rows: 4,
    label: 'Message',
    maxLength: 100,
    helperText: 'Maximum 100 characters',
  } as TextAreaProps,
  
  withMinLength: {
    tenantTheme: defaultTheme,
    value: '',
    placeholder: 'Enter your message...',
    rows: 4,
    label: 'Message',
    minLength: 10,
    helperText: 'Minimum 10 characters required',
  } as TextAreaProps,
};
