import { SelectProps } from './Select';
import { defaultTheme } from '../theme';

export const selectFixtures = {
  default: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    placeholder: 'Select an option...',
  } as SelectProps,
  
  withLabel: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    placeholder: 'Select an option...',
    label: 'Choose Option',
    required: true,
  } as SelectProps,
  
  withError: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    placeholder: 'Select an option...',
    label: 'Choose Option',
    error: 'This field is required',
  } as SelectProps,
  
  withHelperText: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    placeholder: 'Select an option...',
    label: 'Choose Option',
    helperText: 'Please select an option from the list',
  } as SelectProps,
  
  multiSelect: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
      { value: 'option4', label: 'Option 4' },
    ],
    placeholder: 'Select multiple options...',
    label: 'Choose Options',
    multi: true,
  } as SelectProps,
  
  searchable: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
      { value: 'date', label: 'Date' },
      { value: 'elderberry', label: 'Elderberry' },
    ],
    placeholder: 'Search and select...',
    label: 'Choose Fruit',
    searchable: true,
  } as SelectProps,
  
  disabled: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    placeholder: 'Select an option...',
    label: 'Choose Option',
    disabled: true,
  } as SelectProps,
  
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
    placeholder: 'Select an option...',
    label: 'Choose Option',
  } as SelectProps,
  
  withDisabledOptions: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2 (Disabled)', disabled: true },
      { value: 'option3', label: 'Option 3' },
    ],
    placeholder: 'Select an option...',
    label: 'Choose Option',
  } as SelectProps,
  
  clearable: {
    tenantTheme: defaultTheme,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    placeholder: 'Select an option...',
    label: 'Choose Option',
    clearable: true,
    value: 'option1',
  } as SelectProps,
};
