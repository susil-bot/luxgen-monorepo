import React, { useState, useRef } from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';

export interface ProfilePictureProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onImageChange?: (file: File) => void;
  fallbackText?: string;
  tenantTheme?: TenantTheme;
  className?: string;
}

const ProfilePictureComponent: React.FC<ProfilePictureProps> = ({
  src,
  alt = 'Profile picture',
  size = 'lg',
  editable = false,
  onImageChange,
  fallbackText,
  tenantTheme = defaultTheme,
  className = '',
  style = {},
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSizeStyles = () => {
    const sizes = {
      sm: { width: '2rem', height: '2rem', fontSize: '0.75rem' },
      md: { width: '3rem', height: '3rem', fontSize: '1rem' },
      lg: { width: '4rem', height: '4rem', fontSize: '1.25rem' },
      xl: { width: '6rem', height: '6rem', fontSize: '1.5rem' },
    };
    return sizes[size];
  };

  const sizeStyles = getSizeStyles();

  const handleImageClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  const getInitials = (text?: string) => {
    if (!text) return '?';
    return text
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const containerStyle = {
    position: 'relative' as const,
    display: 'inline-block',
    cursor: editable ? 'pointer' : 'default',
    ...style,
  };

  const imageStyle = {
    width: sizeStyles.width,
    height: sizeStyles.height,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: `2px solid ${tenantTheme.colors.border || '#E5E7EB'}`,
    transition: 'all 0.2s ease-in-out',
  };

  const fallbackStyle = {
    width: sizeStyles.width,
    height: sizeStyles.height,
    borderRadius: '50%',
    backgroundColor: tenantTheme.colors.primary || '#3B82F6',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: sizeStyles.fontSize,
    fontWeight: '600',
    border: `2px solid ${tenantTheme.colors.border || '#E5E7EB'}`,
  };

  const editButtonStyle = {
    position: 'absolute' as const,
    bottom: '-0.25rem',
    right: '-0.25rem',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    backgroundColor: tenantTheme.colors.primary || '#3B82F6',
    border: '2px solid #FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div 
      className={`profile-picture-container ${className}`}
      style={containerStyle}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          style={imageStyle}
          onError={() => setImageError(true)}
          onClick={handleImageClick}
        />
      ) : (
        <div style={fallbackStyle} onClick={handleImageClick}>
          {getInitials(fallbackText)}
        </div>
      )}
      
      {editable && (
        <>
          <div style={editButtonStyle}>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </>
      )}
    </div>
  );
};

export const ProfilePicture = withSSR(ProfilePictureComponent);

