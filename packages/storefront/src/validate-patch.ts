import { landingPathFromSlug } from './paths';
import type { StorefrontPatchBody, StorefrontRouteKey, ValidationError } from './types';
import { STOREFRONT_ROUTE_KEYS } from './types';

const STOREFRONT_SLUG_REGEX = /^[a-z0-9-]+$/;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

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

export function validationErrorsToRecord(errors: ValidationError[]): Record<string, string> {
  return errors.reduce(
    (acc, error) => {
      acc[error.field] = error.message;
      return acc;
    },
    {} as Record<string, string>,
  );
}

export function mergeStorefrontPatch(
  existing: Record<string, unknown>,
  patch: StorefrontPatchBody,
): Record<string, unknown> {
  const existingRecord = existing;
  const existingRoutes = (existingRecord.routes as Record<string, unknown> | undefined) ?? {};
  const existingContent = (existingRecord.content as Record<string, unknown> | undefined) ?? {};
  const existingTheme = (existingRecord.theme as Record<string, unknown> | undefined) ?? {};
  const { landingEnabled, slug, routes, content, theme } = patch;

  const mergedRoutes: Record<string, unknown> = { ...existingRoutes };
  if (routes) Object.assign(mergedRoutes, routes);

  if (slug && !routes?.landing) {
    mergedRoutes.landing = landingPathFromSlug(slug);
  }

  const nextStorefront: Record<string, unknown> = {
    ...existingRecord,
    ...(typeof landingEnabled === 'boolean' ? { landingEnabled } : {}),
    ...(slug ? { slug } : {}),
    routes: mergedRoutes,
  };

  if (content) {
    const mergedContent: Record<string, unknown> = { ...existingContent };
    for (const key of ['hero', 'sections', 'stats', 'cta', 'footer'] as const) {
      const sectionPatch = content[key];
      if (sectionPatch && typeof sectionPatch === 'object' && !Array.isArray(sectionPatch)) {
        mergedContent[key] = {
          ...(mergedContent[key] as Record<string, unknown>),
          ...(sectionPatch as Record<string, unknown>),
        };
      } else if (sectionPatch !== undefined) {
        mergedContent[key] = sectionPatch;
      }
    }
    nextStorefront.content = mergedContent;
  }

  if (theme) {
    nextStorefront.theme = { ...existingTheme, ...theme };
  }

  return nextStorefront;
}
