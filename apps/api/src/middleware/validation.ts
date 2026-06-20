import { Request, Response, NextFunction } from 'express';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation
const PASSWORD_MIN_LENGTH = 6;

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Email format is invalid';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  return null;
};

export const validateName = (name: string, fieldName: string): string | null => {
  if (!name) return `${fieldName} is required`;
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
  return null;
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) errors.push({ field: 'email', message: emailError });

  const passwordError = validatePassword(password);
  if (passwordError) errors.push({ field: 'password', message: passwordError });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.reduce(
        (acc, error) => {
          acc[error.field] = error.message;
          return acc;
        },
        {} as Record<string, string>,
      ),
    });
  }

  next();
};

const STOREFRONT_ROUTE_KEYS = ['landing', 'courses', 'programs', 'login', 'register'] as const;

export type StorefrontRouteKey = (typeof STOREFRONT_ROUTE_KEYS)[number];

export interface StorefrontPatchBody {
  landingEnabled?: boolean;
  routes?: Partial<Record<StorefrontRouteKey, string>>;
}

export function validateStorefrontPatchBody(
  body: unknown,
): { ok: true; data: StorefrontPatchBody } | { ok: false; errors: ValidationError[] } {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return {
      ok: false,
      errors: [{ field: 'body', message: 'Request body must be a JSON object' }],
    };
  }

  const obj = body as Record<string, unknown>;
  const errors: ValidationError[] = [];
  const hasLandingEnabled = 'landingEnabled' in obj;
  const hasRoutes = 'routes' in obj;

  if (!hasLandingEnabled && !hasRoutes) {
    errors.push({ field: 'body', message: 'At least one of landingEnabled or routes is required' });
  }

  let landingEnabled: boolean | undefined;
  if (hasLandingEnabled) {
    if (typeof obj.landingEnabled !== 'boolean') {
      errors.push({ field: 'landingEnabled', message: 'landingEnabled must be a boolean' });
    } else {
      landingEnabled = obj.landingEnabled;
    }
  }

  let routes: StorefrontPatchBody['routes'] | undefined;
  if (hasRoutes) {
    if (obj.routes === null || typeof obj.routes !== 'object' || Array.isArray(obj.routes)) {
      errors.push({ field: 'routes', message: 'routes must be an object' });
    } else {
      const routesObj = obj.routes as Record<string, unknown>;
      const validatedRoutes: NonNullable<StorefrontPatchBody['routes']> = {};

      for (const key of Object.keys(routesObj)) {
        if (!STOREFRONT_ROUTE_KEYS.includes(key as StorefrontRouteKey)) {
          errors.push({ field: `routes.${key}`, message: `Unknown route key: ${key}` });
          continue;
        }

        const value = routesObj[key];
        if (typeof value !== 'string' || !value.trim()) {
          errors.push({ field: `routes.${key}`, message: `${key} must be a non-empty string` });
          continue;
        }

        const path = value.trim();
        if (!path.startsWith('/')) {
          errors.push({
            field: `routes.${key}`,
            message: `${key} must be an absolute path starting with /`,
          });
          continue;
        }

        validatedRoutes[key as StorefrontRouteKey] = path;
      }

      routes = validatedRoutes;
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      ...(landingEnabled !== undefined ? { landingEnabled } : {}),
      ...(routes !== undefined ? { routes } : {}),
    },
  };
}

export const validationErrorsToRecord = (errors: ValidationError[]): Record<string, string> =>
  errors.reduce(
    (acc, error) => {
      acc[error.field] = error.message;
      return acc;
    },
    {} as Record<string, string>,
  );

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName } = req.body;
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) errors.push({ field: 'email', message: emailError });

  const passwordError = validatePassword(password);
  if (passwordError) errors.push({ field: 'password', message: passwordError });

  const firstNameError = validateName(firstName, 'First name');
  if (firstNameError) errors.push({ field: 'firstName', message: firstNameError });

  const lastNameError = validateName(lastName, 'Last name');
  if (lastNameError) errors.push({ field: 'lastName', message: lastNameError });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.reduce(
        (acc, error) => {
          acc[error.field] = error.message;
          return acc;
        },
        {} as Record<string, string>,
      ),
    });
  }

  next();
};
