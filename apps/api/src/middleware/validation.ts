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

const STOREFRONT_SLUG_REGEX = /^[a-z0-9-]+$/;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function landingPathFromSlug(slug: string): string {
  const normalized = slug.trim().replace(/^\/+|\/+$/g, '');
  if (!normalized) return '/store/mentors';
  return normalized.startsWith('store/') ? `/${normalized}` : `/store/${normalized}`;
}

function asPlainObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function validateOptionalStringObject(
  raw: unknown,
  fieldPrefix: string,
  errors: ValidationError[],
): Record<string, string> | undefined {
  const obj = asPlainObject(raw);
  if (!obj) {
    if (raw !== undefined) errors.push({ field: fieldPrefix, message: `${fieldPrefix} must be an object` });
    return undefined;
  }
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value !== 'string' || !value.trim()) {
      errors.push({ field: `${fieldPrefix}.${key}`, message: `${key} must be a non-empty string` });
      continue;
    }
    result[key] = value.trim();
  }
  return result;
}

export interface StorefrontPatchBody {
  landingEnabled?: boolean;
  slug?: string;
  routes?: Partial<Record<StorefrontRouteKey, string>>;
  content?: Record<string, unknown>;
  theme?: {
    accentColor?: string;
    warmAccentColor?: string;
    heroImage?: string;
    layout?: 'classic' | 'split';
  };
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
  const hasSlug = 'slug' in obj;
  const hasContent = 'content' in obj;
  const hasTheme = 'theme' in obj;

  if (!hasLandingEnabled && !hasRoutes && !hasSlug && !hasContent && !hasTheme) {
    errors.push({
      field: 'body',
      message: 'At least one of landingEnabled, slug, routes, content, or theme is required',
    });
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

  let slug: string | undefined;
  if (hasSlug) {
    if (typeof obj.slug !== 'string' || !obj.slug.trim()) {
      errors.push({ field: 'slug', message: 'slug must be a non-empty string' });
    } else {
      const normalized = obj.slug.trim().toLowerCase();
      if (!STOREFRONT_SLUG_REGEX.test(normalized)) {
        errors.push({
          field: 'slug',
          message: 'slug can only contain lowercase letters, numbers, and hyphens',
        });
      } else {
        slug = normalized;
      }
    }
  }

  let content: Record<string, unknown> | undefined;
  if (hasContent) {
    const contentObj = asPlainObject(obj.content);
    if (!contentObj) {
      errors.push({ field: 'content', message: 'content must be an object' });
    } else {
      content = { ...contentObj };
      const hero = validateOptionalStringObject(contentObj.hero, 'content.hero', errors);
      const sections = validateOptionalStringObject(contentObj.sections, 'content.sections', errors);
      const stats = validateOptionalStringObject(contentObj.stats, 'content.stats', errors);
      const cta = validateOptionalStringObject(contentObj.cta, 'content.cta', errors);
      const footer = validateOptionalStringObject(contentObj.footer, 'content.footer', errors);
      if (hero) content.hero = hero;
      if (sections) content.sections = sections;
      if (stats) content.stats = stats;
      if (cta) content.cta = cta;
      if (footer) content.footer = footer;
    }
  }

  let theme: StorefrontPatchBody['theme'] | undefined;
  if (hasTheme) {
    const themeObj = asPlainObject(obj.theme);
    if (!themeObj) {
      errors.push({ field: 'theme', message: 'theme must be an object' });
    } else {
      const nextTheme: NonNullable<StorefrontPatchBody['theme']> = {};
      if ('accentColor' in themeObj) {
        if (typeof themeObj.accentColor !== 'string' || !HEX_COLOR_REGEX.test(themeObj.accentColor)) {
          errors.push({ field: 'theme.accentColor', message: 'accentColor must be a hex color (#RRGGBB)' });
        } else {
          nextTheme.accentColor = themeObj.accentColor;
        }
      }
      if ('warmAccentColor' in themeObj) {
        if (typeof themeObj.warmAccentColor !== 'string' || !HEX_COLOR_REGEX.test(themeObj.warmAccentColor)) {
          errors.push({ field: 'theme.warmAccentColor', message: 'warmAccentColor must be a hex color (#RRGGBB)' });
        } else {
          nextTheme.warmAccentColor = themeObj.warmAccentColor;
        }
      }
      if ('heroImage' in themeObj) {
        if (typeof themeObj.heroImage !== 'string' || !themeObj.heroImage.trim()) {
          errors.push({ field: 'theme.heroImage', message: 'heroImage must be a non-empty string' });
        } else {
          nextTheme.heroImage = themeObj.heroImage.trim();
        }
      }
      if ('layout' in themeObj) {
        if (themeObj.layout !== 'classic' && themeObj.layout !== 'split') {
          errors.push({ field: 'theme.layout', message: 'layout must be classic or split' });
        } else {
          nextTheme.layout = themeObj.layout;
        }
      }
      theme = Object.keys(nextTheme).length > 0 ? nextTheme : {};
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      ...(landingEnabled !== undefined ? { landingEnabled } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(routes !== undefined ? { routes } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(theme !== undefined ? { theme } : {}),
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
