import { FormComponentProps } from './Form';
import { defaultTheme } from '../theme';

export const formFixtures = {
  default: {
    tenantTheme: defaultTheme,
    method: 'POST' as const,
    action: '/submit',
    encType: 'application/x-www-form-urlencoded' as const,
    noValidate: false,
    children: (
      <>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" />
        </div>
        <div className="form-actions">
          <button type="submit">Submit</button>
        </div>
      </>
    ),
  } as FormComponentProps,
  
  withValidation: {
    tenantTheme: defaultTheme,
    method: 'POST' as const,
    action: '/submit',
    encType: 'application/x-www-form-urlencoded' as const,
    noValidate: false,
    children: (
      <>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="button">Cancel</button>
        </div>
      </>
    ),
  } as FormComponentProps,
  
  withFileUpload: {
    tenantTheme: defaultTheme,
    method: 'POST' as const,
    action: '/upload',
    encType: 'multipart/form-data' as const,
    noValidate: false,
    children: (
      <>
        <div className="form-group">
          <label htmlFor="file">Upload File</label>
          <input type="file" id="file" name="file" />
        </div>
        <div className="form-actions">
          <button type="submit">Upload</button>
        </div>
      </>
    ),
  } as FormComponentProps,
  
  withCustomTheme: {
    tenantTheme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#8B5CF6',
        text: '#1F2937',
      },
    },
    method: 'POST' as const,
    action: '/submit',
    encType: 'application/x-www-form-urlencoded' as const,
    noValidate: false,
    children: (
      <>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" />
        </div>
        <div className="form-actions">
          <button type="submit">Submit</button>
        </div>
      </>
    ),
  } as FormComponentProps,
  
  withNoValidation: {
    tenantTheme: defaultTheme,
    method: 'POST' as const,
    action: '/submit',
    encType: 'application/x-www-form-urlencoded' as const,
    noValidate: true,
    children: (
      <>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" />
        </div>
        <div className="form-actions">
          <button type="submit">Submit</button>
        </div>
      </>
    ),
  } as FormComponentProps,
  
  withGetMethod: {
    tenantTheme: defaultTheme,
    method: 'GET' as const,
    action: '/search',
    encType: 'application/x-www-form-urlencoded' as const,
    noValidate: false,
    children: (
      <>
        <div className="form-group">
          <label htmlFor="query">Search Query</label>
          <input type="text" id="query" name="query" />
        </div>
        <div className="form-actions">
          <button type="submit">Search</button>
        </div>
      </>
    ),
  } as FormComponentProps,
};
