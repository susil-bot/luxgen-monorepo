import React, { useState } from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  dateOfBirth: string;
  permanentAddress: string;
  presentAddress: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface ProfileFormProps extends BaseComponentProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit?: (data: ProfileFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  tenantTheme?: TenantTheme;
  showPassword?: boolean;
  showAddress?: boolean;
  showPersonalInfo?: boolean;
}

const ProfileFormComponent: React.FC<ProfileFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  tenantTheme = defaultTheme,
  showPassword = true,
  showAddress = true,
  showPersonalInfo = true,
  className = '',
  style = {},
  ...props
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    dateOfBirth: '',
    permanentAddress: '',
    presentAddress: '',
    city: '',
    country: '',
    postalCode: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  const getInputStyles = (hasError: boolean) => ({
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${hasError ? '#EF4444' : tenantTheme.colors.border || '#D1D5DB'}`,
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    color: tenantTheme.colors.text || '#374151',
    backgroundColor: '#FFFFFF',
    transition: 'border-color 0.2s ease-in-out',
    outline: 'none',
    '&:focus': {
      borderColor: tenantTheme.colors.primary || '#3B82F6',
      boxShadow: `0 0 0 3px ${tenantTheme.colors.primary || '#3B82F6'}20`,
    },
  });

  const getLabelStyles = () => ({
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: tenantTheme.colors.text || '#374151',
    marginBottom: '0.5rem',
  });

  const getButtonStyles = (variant: 'primary' | 'secondary') => ({
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    opacity: loading ? 0.6 : 1,
    ...(variant === 'primary' ? {
      backgroundColor: tenantTheme.colors.primary || '#3B82F6',
      color: '#FFFFFF',
    } : {
      backgroundColor: 'transparent',
      color: tenantTheme.colors.text || '#374151',
      border: `1px solid ${tenantTheme.colors.border || '#D1D5DB'}`,
    }),
  });

  return (
    <form 
      onSubmit={handleSubmit}
      className={`profile-form ${className}`}
      style={style}
      {...props}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column */}
        <div className="form-column">
          {showPersonalInfo && (
            <>
              <div className="form-group">
                <label style={getLabelStyles()}>Your Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  style={getInputStyles(!!errors.firstName)}
                  placeholder="Enter your first name"
                  disabled={loading}
                />
                {errors.firstName && (
                  <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.firstName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label style={getLabelStyles()}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={getInputStyles(!!errors.email)}
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {errors.email && (
                  <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label style={getLabelStyles()}>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  style={getInputStyles(!!errors.dateOfBirth)}
                  disabled={loading}
                />
                {errors.dateOfBirth && (
                  <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.dateOfBirth}
                  </span>
                )}
              </div>

              {showAddress && (
                <>
                  <div className="form-group">
                    <label style={getLabelStyles()}>Permanent Address</label>
                    <input
                      type="text"
                      value={formData.permanentAddress}
                      onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                      style={getInputStyles(!!errors.permanentAddress)}
                      placeholder="Enter permanent address"
                      disabled={loading}
                    />
                    {errors.permanentAddress && (
                      <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {errors.permanentAddress}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label style={getLabelStyles()}>Postal Code</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      style={getInputStyles(!!errors.postalCode)}
                      placeholder="Enter postal code"
                      disabled={loading}
                    />
                    {errors.postalCode && (
                      <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {errors.postalCode}
                      </span>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="form-column">
          <div className="form-group">
            <label style={getLabelStyles()}>User Name</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              style={getInputStyles(!!errors.username)}
              placeholder="Enter username"
              disabled={loading}
            />
            {errors.username && (
              <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.username}
              </span>
            )}
          </div>

          {showPassword && (
            <div className="form-group">
              <label style={getLabelStyles()}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                style={getInputStyles(!!errors.password)}
                placeholder="Enter new password"
                disabled={loading}
              />
              {errors.password && (
                <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.password}
                </span>
              )}
            </div>
          )}

          {showAddress && (
            <>
              <div className="form-group">
                <label style={getLabelStyles()}>Present Address</label>
                <input
                  type="text"
                  value={formData.presentAddress}
                  onChange={(e) => handleInputChange('presentAddress', e.target.value)}
                  style={getInputStyles(!!errors.presentAddress)}
                  placeholder="Enter present address"
                  disabled={loading}
                />
                {errors.presentAddress && (
                  <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.presentAddress}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label style={getLabelStyles()}>City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  style={getInputStyles(!!errors.city)}
                  placeholder="Enter city"
                  disabled={loading}
                />
                {errors.city && (
                  <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.city}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label style={getLabelStyles()}>Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  style={getInputStyles(!!errors.country)}
                  placeholder="Enter country"
                  disabled={loading}
                />
                {errors.country && (
                  <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.country}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '1rem', 
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: `1px solid ${tenantTheme.colors.border || '#E5E7EB'}`
      }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={getButtonStyles('secondary')}
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          style={getButtonStyles('primary')}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export const ProfileForm = withSSR(ProfileFormComponent);

