import { TenantTheme } from '../types';

export const getLoginFormStyles = (tenantTheme: TenantTheme) => ({
  container: {
    backgroundColor: tenantTheme.colors.background,
    border: `1px solid ${tenantTheme.colors.border}`,
    borderRadius: tenantTheme.borderRadius.lg,
    boxShadow: tenantTheme.shadows.lg,
    fontFamily: tenantTheme.fonts.primary,
  },
  header: {
    color: tenantTheme.colors.text,
    fontFamily: tenantTheme.fonts.primary,
  },
  subtitle: {
    color: tenantTheme.colors.textSecondary,
    fontFamily: tenantTheme.fonts.primary,
  },
  input: {
    backgroundColor: tenantTheme.colors.backgroundSecondary,
    borderColor: tenantTheme.colors.border,
    color: tenantTheme.colors.text,
    fontFamily: tenantTheme.fonts.primary,
  },
  inputError: {
    borderColor: tenantTheme.colors.error,
  },
  button: {
    backgroundColor: tenantTheme.colors.primary,
    color: tenantTheme.colors.background,
    fontFamily: tenantTheme.fonts.primary,
  },
  buttonHover: {
    backgroundColor: tenantTheme.colors.primary,
    opacity: 0.9,
  },
  socialButton: {
    borderColor: tenantTheme.colors.border,
    color: tenantTheme.colors.text,
    backgroundColor: tenantTheme.colors.backgroundSecondary,
    fontFamily: tenantTheme.fonts.primary,
  },
  socialButtonHover: {
    backgroundColor: tenantTheme.colors.backgroundSecondary,
    opacity: 0.8,
  },
  link: {
    color: tenantTheme.colors.primary,
    fontFamily: tenantTheme.fonts.primary,
  },
  linkHover: {
    color: tenantTheme.colors.primary,
    opacity: 0.8,
  },
  error: {
    backgroundColor: tenantTheme.colors.error + '20',
    borderColor: tenantTheme.colors.error,
    color: tenantTheme.colors.error,
  },
  success: {
    backgroundColor: tenantTheme.colors.success + '20',
    borderColor: tenantTheme.colors.success,
    color: tenantTheme.colors.success,
  },
  divider: {
    borderColor: tenantTheme.colors.border,
  },
  dividerText: {
    backgroundColor: tenantTheme.colors.background,
    color: tenantTheme.colors.textSecondary,
  },
});
