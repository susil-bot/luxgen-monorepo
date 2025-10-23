import { SwitchProps } from './Switch';
import { defaultTheme } from '../theme';

export const switchFixtures = {
  default: {
    tenantTheme: defaultTheme,
    checked: false,
    label: 'Switch Label',
  } as SwitchProps,
  
  checked: {
    tenantTheme: defaultTheme,
    checked: true,
    label: 'Checked Switch',
  } as SwitchProps,
  
  withLabel: {
    tenantTheme: defaultTheme,
    checked: false,
    label: 'Switch with Label',
    required: true,
  } as SwitchProps,
  
  withError: {
    tenantTheme: defaultTheme,
    checked: false,
    label: 'Switch with Error',
    error: 'This field is required',
  } as SwitchProps,
  
  withHelperText: {
    tenantTheme: defaultTheme,
    checked: false,
    label: 'Switch with Helper Text',
    helperText: 'Toggle this switch to enable the feature',
  } as SwitchProps,
  
  disabled: {
    tenantTheme: defaultTheme,
    checked: false,
    label: 'Disabled Switch',
    disabled: true,
  } as SwitchProps,
  
  disabledChecked: {
    tenantTheme: defaultTheme,
    checked: true,
    label: 'Disabled Checked Switch',
    disabled: true,
  } as SwitchProps,
  
  small: {
    tenantTheme: defaultTheme,
    checked: false,
    label: 'Small Switch',
    size: 'sm' as const,
  } as SwitchProps,
  
  large: {
    tenantTheme: defaultTheme,
    checked: false,
    label: 'Large Switch',
    size: 'lg' as const,
  } as SwitchProps,
  
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
    label: 'Custom Themed Switch',
  } as SwitchProps,
  
  withoutLabel: {
    tenantTheme: defaultTheme,
    checked: false,
  } as SwitchProps,
};
