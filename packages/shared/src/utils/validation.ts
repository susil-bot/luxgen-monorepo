/**
 * Shared validation utilities
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ValidationUtils {
  /**
   * Validate email format
   */
  public static validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(email);
    
    return {
      valid,
      errors: valid ? [] : ['Invalid email format']
    };
  }
  
  /**
   * Validate password strength
   */
  public static validatePassword(
    password: string,
    policy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    }
  ): ValidationResult {
    const errors: string[] = [];
    
    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }
    
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (policy.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one symbol');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate subdomain format
   */
  public static validateSubdomain(subdomain: string): ValidationResult {
    const subdomainRegex = /^[a-z0-9-]+$/;
    const valid = subdomainRegex.test(subdomain) && subdomain.length >= 2 && subdomain.length <= 63;
    
    return {
      valid,
      errors: valid ? [] : ['Subdomain can only contain lowercase letters, numbers, and hyphens, and must be 2-63 characters long']
    };
  }
  
  /**
   * Validate hex color format
   */
  public static validateHexColor(color: string): ValidationResult {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    const valid = hexColorRegex.test(color);
    
    return {
      valid,
      errors: valid ? [] : ['Color must be a valid hex color (e.g., #FF0000)']
    };
  }
  
  /**
   * Validate URL format
   */
  public static validateUrl(url: string): ValidationResult {
    try {
      new URL(url);
      return { valid: true, errors: [] };
    } catch {
      return { valid: false, errors: ['Invalid URL format'] };
    }
  }
  
  /**
   * Validate JSON string
   */
  public static validateJson(jsonString: string): ValidationResult {
    try {
      JSON.parse(jsonString);
      return { valid: true, errors: [] };
    } catch (error) {
      return { valid: false, errors: ['Invalid JSON format'] };
    }
  }
}
