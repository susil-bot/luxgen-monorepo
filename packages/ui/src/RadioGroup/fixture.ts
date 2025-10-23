import { RadioGroupProps } from './RadioGroup';
import { defaultTheme } from '../theme';

export const radioGroupFixtures = {
  default: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    name: 'radio-group',
    value: 'option1',
  } as RadioGroupProps,
  
  withLabel: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    name: 'radio-group',
    value: 'option1',
    label: 'Choose Option',
    required: true,
  } as RadioGroupProps,
  
  withError: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    name: 'radio-group',
    value: '',
    label: 'Choose Option',
    error: 'This field is required',
  } as RadioGroupProps,
  
  withHelperText: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    name: 'radio-group',
    value: 'option1',
    label: 'Choose Option',
    helperText: 'Please select one option from the list',
  } as RadioGroupProps,
  
  horizontal: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    name: 'radio-group',
    value: 'option1',
    label: 'Choose Option',
    orientation: 'horizontal' as const,
  } as RadioGroupProps,
  
  disabled: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    name: 'radio-group',
    value: 'option1',
    label: 'Choose Option',
    disabled: true,
  } as RadioGroupProps,
  
  withDisabledOptions: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2 (Disabled)', disabled: true },
      { value: 'option3', label: 'Option 3' },
    ],
    name: 'radio-group',
    value: 'option1',
    label: 'Choose Option',
  } as RadioGroupProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
        border: '#D1D5DB',
      },
    },
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    name: 'radio-group',
    value: 'option1',
    label: 'Choose Option',
  } as RadioGroupProps,
  
  manyOptions: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
      { value: 'option4', label: 'Option 4' },
      { value: 'option5', label: 'Option 5' },
      { value: 'option6', label: 'Option 6' },
    ],
    name: 'radio-group',
    value: 'option1',
    label: 'Choose Option',
  } as RadioGroupProps,
  
  noSelection: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    name: 'radio-group',
    value: '',
    label: 'Choose Option',
  } as RadioGroupProps,
};
