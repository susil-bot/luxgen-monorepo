/**
 * Transformer for upcoming UI components
 * This file contains utilities for transforming and processing component data
 * for future components that will be added to the UI library.
 */

/**
 * Transforms component props to a standardized format
 * @param {Object} props - Component props
 * @param {Object} options - Transformation options
 * @returns {Object} Transformed props
 */
export const transformComponentProps = (props: any, options: any = {}) => {
  const {
    includeTheme = true,
    includeSSR = true,
    includeTranslations = true,
    includeStyles = true,
    includeTests = true,
  } = options;

  const transformed = {
    ...props,
    // Add common transformations
    id: props.id || `component-${Date.now()}`,
    className: props.className || '',
    style: props.style || {},
  };

  if (includeTheme && props.tenantTheme) {
    transformed.theme = {
      colors: props.tenantTheme.colors,
      fonts: props.tenantTheme.fonts,
      spacing: props.tenantTheme.spacing,
      breakpoints: props.tenantTheme.breakpoints,
    };
  }

  if (includeSSR) {
    transformed.ssr = {
      enabled: true,
      hydrate: true,
      fallback: props.fallback || null,
    };
  }

  if (includeTranslations) {
    transformed.translations = {
      locale: props.locale || 'en',
      fallback: 'en',
      namespace: props.namespace || 'ui',
    };
  }

  if (includeStyles) {
    transformed.styles = {
      variant: props.variant || 'default',
      size: props.size || 'medium',
      theme: props.theme || 'light',
    };
  }

  if (includeTests) {
    transformed.testing = {
      testId: props.testId || `test-${props.id}`,
      accessible: props.accessible !== false,
      keyboard: props.keyboard !== false,
    };
  }

  return transformed;
};

/**
 * Transforms component data for SSR rendering
 * @param {Object} componentData - Component data
 * @param {Object} options - SSR options
 * @returns {Object} SSR-ready data
 */
export const transformForSSR = (componentData: any, options: any = {}) => {
  const {
    includeStyles = true,
    includeScripts = true,
    includeMeta = true,
  } = options;

  const ssrData = {
    html: componentData.html || '',
    styles: includeStyles ? componentData.styles || '' : '',
    scripts: includeScripts ? componentData.scripts || [] : [],
    meta: includeMeta ? componentData.meta || {} : {},
  };

  // Add hydration markers
  ssrData.hydration = {
    id: componentData.id || `ssr-${Date.now()}`,
    props: componentData.props || {},
    state: componentData.state || {},
  };

  return ssrData;
};

/**
 * Transforms component styles for different themes
 * @param {Object} styles - Component styles
 * @param {Object} theme - Theme object
 * @param {Object} options - Style options
 * @returns {Object} Transformed styles
 */
export const transformStyles = (styles: any, theme: any, options: any = {}) => {
  const {
    includeResponsive = true,
    includeDarkMode = true,
    includeAnimations = true,
  } = options;

  const transformed = {
    base: styles.base || {},
    variants: styles.variants || {},
    sizes: styles.sizes || {},
    states: styles.states || {},
  };

  if (includeResponsive) {
    transformed.responsive = {
      mobile: styles.mobile || {},
      tablet: styles.tablet || {},
      desktop: styles.desktop || {},
    };
  }

  if (includeDarkMode) {
    transformed.darkMode = {
      base: styles.darkMode?.base || {},
      variants: styles.darkMode?.variants || {},
    };
  }

  if (includeAnimations) {
    transformed.animations = {
      enter: styles.animations?.enter || {},
      exit: styles.animations?.exit || {},
      transition: styles.animations?.transition || {},
    };
  }

  // Apply theme transformations
  transformed.theme = {
    colors: theme.colors,
    fonts: theme.fonts,
    spacing: theme.spacing,
    breakpoints: theme.breakpoints,
  };

  return transformed;
};

/**
 * Transforms component translations for i18n
 * @param {Object} translations - Component translations
 * @param {string} locale - Target locale
 * @param {Object} options - Translation options
 * @returns {Object} Transformed translations
 */
export const transformTranslations = (translations: any, locale: string, options: any = {}) => {
  const {
    includeFallback = true,
    includeNamespace = true,
    includePluralization = true,
  } = options;

  const transformed = {
    locale,
    translations: translations[locale] || {},
    fallback: includeFallback ? ((translations as any).en || {}),
    namespace: includeNamespace ? 'ui' : undefined,
  };

  if (includePluralization) {
    transformed.pluralization = {
      rules: translations.pluralization?.rules || {},
      forms: translations.pluralization?.forms || {},
    };
  }

  return transformed;
};

/**
 * Transforms component tests for different testing frameworks
 * @param {Object} tests - Component tests
 * @param {string} framework - Testing framework
 * @param {Object} options - Testing options
 * @returns {Object} Transformed tests
 */
export const transformTests = (tests: any, framework: string = 'jest', options: any = {}) => {
  const {
    includeAccessibility = true,
    includeVisual = true,
    includePerformance = true,
  } = options;

  const transformed = {
    framework,
    unit: tests.unit || [],
    integration: tests.integration || [],
    e2e: tests.e2e || [],
  };

  if (includeAccessibility) {
    transformed.accessibility = {
      axe: tests.accessibility?.axe || [],
      keyboard: tests.accessibility?.keyboard || [],
      screenReader: tests.accessibility?.screenReader || [],
    };
  }

  if (includeVisual) {
    transformed.visual = {
      screenshots: tests.visual?.screenshots || [],
      regression: tests.visual?.regression || [],
    };
  }

  if (includePerformance) {
    transformed.performance = {
      metrics: tests.performance?.metrics || [],
      benchmarks: tests.performance?.benchmarks || [],
    };
  }

  return transformed;
};

/**
 * Transforms component fixtures for testing
 * @param {Object} fixtures - Component fixtures
 * @param {Object} options - Fixture options
 * @returns {Object} Transformed fixtures
 */
export const transformFixtures = (fixtures: any, options: any = {}) => {
  const {
    includeVariants = true,
    includeStates = true,
    includeEdgeCases = true,
  } = options;

  const transformed = {
    default: fixtures.default || {},
    variants: includeVariants ? fixtures.variants || {} : {},
    states: includeStates ? fixtures.states || {} : {},
    edgeCases: includeEdgeCases ? fixtures.edgeCases || {} : {},
  };

  // Add common fixture transformations
  transformed.common = {
    props: fixtures.props || {},
    children: fixtures.children || {},
    events: fixtures.events || {},
  };

  return transformed;
};

/**
 * Transforms component data for documentation
 * @param {Object} componentData - Component data
 * @param {Object} options - Documentation options
 * @returns {Object} Documentation-ready data
 */
export const transformForDocumentation = (componentData: any, options: any = {}) => {
  const {
    includeExamples = true,
    includeAPI = true,
    includeStories = true,
  } = options;

  const transformed = {
    name: componentData.name || 'Component',
    description: componentData.description || '',
    category: componentData.category || 'UI',
    tags: componentData.tags || [],
  };

  if (includeExamples) {
    transformed.examples = {
      basic: componentData.examples?.basic || [],
      advanced: componentData.examples?.advanced || [],
      interactive: componentData.examples?.interactive || [],
    };
  }

  if (includeAPI) {
    transformed.api = {
      props: componentData.api?.props || {},
      events: componentData.api?.events || {},
      methods: componentData.api?.methods || {},
    };
  }

  if (includeStories) {
    transformed.stories = {
      default: componentData.stories?.default || {},
      variants: componentData.stories?.variants || {},
      states: componentData.stories?.states || {},
    };
  }

  return transformed;
};

/**
 * Main transformer function that orchestrates all transformations
 * @param {Object} componentData - Raw component data
 * @param {Object} options - Transformation options
 * @returns {Object} Fully transformed component data
 */
export const transformComponent = (componentData: any, options: any = {}) => {
  const {
    includeSSR = true,
    includeStyles = true,
    includeTranslations = true,
    includeTests = true,
    includeDocumentation = true,
  } = options;

  const transformed = {
    ...componentData,
    id: componentData.id || `component-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  // Transform props
  transformed.props = transformComponentProps(componentData.props, options);

  // Transform SSR data
  if (includeSSR) {
    transformed.ssr = transformForSSR(componentData.ssr, options);
  }

  // Transform styles
  if (includeStyles) {
    transformed.styles = transformStyles(componentData.styles, componentData.theme, options);
  }

  // Transform translations
  if (includeTranslations) {
    transformed.translations = transformTranslations(componentData.translations, componentData.locale, options);
  }

  // Transform tests
  if (includeTests) {
    transformed.tests = transformTests(componentData.tests, options.framework, options);
  }

  // Transform fixtures
  transformed.fixtures = transformFixtures(componentData.fixtures, options);

  // Transform documentation
  if (includeDocumentation) {
    transformed.documentation = transformForDocumentation(componentData.documentation, options);
  }

  return transformed;
};

/**
 * Utility function to validate transformed component data
 * @param {Object} transformedData - Transformed component data
 * @returns {Object} Validation results
 */
export const validateTransformedComponent = (transformedData: any) => {
  const errors = [];
  const warnings = [];

  // Validate required fields
  if (!transformedData.id) {
    errors.push('Component ID is required');
  }

  if (!transformedData.props) {
    errors.push('Component props are required');
  }

  // Validate SSR data
  if (transformedData.ssr && !transformedData.ssr.html) {
    warnings.push('SSR HTML is missing');
  }

  // Validate styles
  if (transformedData.styles && !transformedData.styles.base) {
    warnings.push('Base styles are missing');
  }

  // Validate translations
  if (transformedData.translations && !transformedData.translations.translations) {
    warnings.push('Translations are missing');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export default {
  transformComponentProps,
  transformForSSR,
  transformStyles,
  transformTranslations,
  transformTests,
  transformFixtures,
  transformForDocumentation,
  transformComponent,
  validateTransformedComponent,
};
