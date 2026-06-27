/** Shared form validation (UI-185, UI-186). */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function passwordMeetsMinimum(value: string): boolean {
  return value.length >= PASSWORD_MIN_LENGTH;
}

export function passwordErrorMessage(): string {
  return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
}
