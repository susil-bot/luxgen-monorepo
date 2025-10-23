import { CheckboxProps } from './Checkbox';
import { defaultTheme } from '../theme';

export const checkboxFixtures = {
  default: {
    tenantTheme: defaultTheme,
    checked: false,
    label: 'Checkbox Label',
  } as CheckboxProps,
  
  checked: {
    tenantTheme: defaultTheme,
    checked: true,
    label: 'Checked Checkbox',
  } as CheckboxProps,
  
  withLabel: {
    tenantTheme: defaultTheme,
    checked: false,
    label: 'Checkbox with Label',
    required: true,
  } as CheckboxProps,
  
  withError: {
    tenantTheme: defaultTheme,
    checked: false,
    label: 'Checkbox with Error',
    error: 'This field is required',
  } as CheckboxProps,
  
  withHelperText: {
    tenantTheme: defaultTheme,
    checked: false,
    label: 'Checkbox with Helper Text',
    helperText: 'Please check this box to continue',
  } as CheckboxProps,
  
  disabled: {
    tenantTheme: defaultTheme,
    checked: false,
    label: 'Disabled Checkbox',
    disabled: true,
  } as CheckboxProps,
  
  disabledChecked: {
    tenantTheme: defaultTheme,
    checked: true,
    label: 'Disabled Checked Checkbox',
    disabled: true,
  } as CheckboxProps,
  
  indeterminate: {
    tenantTheme: defaultTheme,
    checked: false,
    label: 'Indeterminate Checkbox',
    indeterminate: true,
  } as CheckboxProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
        border: '#D1D5DB',
      },
    },
    checked: false,
    label: 'Custom Themed Checkbox',
  } as CheckboxProps,
  
  withoutLabel: {
    tenantTheme: defaultTheme,
    checked: false,
  } as CheckboxProps,
};
