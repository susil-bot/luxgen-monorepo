import { GridContainerProps } from './GridContainer';
import { defaultTheme } from '../theme';

export const gridContainerFixtures = {
  default: {
    tenantTheme: defaultTheme,
    columns: 3,
    gap: '1rem',
    children: (
      <>
        <div>Grid Item 1</div>
        <div>Grid Item 2</div>
        <div>Grid Item 3</div>
      </>
    ),
  } as GridContainerProps,
  
  twoColumns: {
    tenantTheme: defaultTheme,
    columns: 2,
    gap: '1.5rem',
    children: (
      <>
        <div>Grid Item 1</div>
        <div>Grid Item 2</div>
      </>
    ),
  } as GridContainerProps,
  
  fourColumns: {
    tenantTheme: defaultTheme,
    columns: 4,
    gap: '0.5rem',
    children: (
      <>
        <div>Grid Item 1</div>
        <div>Grid Item 2</div>
        <div>Grid Item 3</div>
        <div>Grid Item 4</div>
      </>
    ),
  } as GridContainerProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
      },
    },
    columns: 3,
    gap: '2rem',
    children: (
      <>
        <div>Grid Item 1</div>
        <div>Grid Item 2</div>
        <div>Grid Item 3</div>
      </>
    ),
  } as GridContainerProps,
  
  singleColumn: {
    tenantTheme: defaultTheme,
    columns: 1,
    gap: '1rem',
    children: (
      <>
        <div>Grid Item 1</div>
        <div>Grid Item 2</div>
        <div>Grid Item 3</div>
      </>
    ),
  } as GridContainerProps,
};
