import { ComponentType } from 'react';
import { Plugin } from './Plugin';
import { PhaseSet } from './PhaseSet';
import { WorkflowContext } from './WorkflowContext';

/**
 * Presenter is a plugin that is associated with specific routes on content types.
 * Examples of Presenters: Identifier, Bundle, Search
 * Presenters are combined with Tenants to create a route handler.
 */
export class Presenter extends Plugin {
  public route: string;
  public contentType: string;
  public tenant?: string;

  constructor(
    name: string,
    route: string,
    contentType: string,
    phaseSet: PhaseSet,
    component?: ComponentType,
    tenant?: string
  ) {
    super(name, phaseSet, component);
    this.route = route;
    this.contentType = contentType;
    this.tenant = tenant;
  }

  /**
   * Check if the presenter matches a given route and content type
   * @param route - The route to match
   * @param contentType - The content type to match
   * @param tenant - The tenant to match (optional)
   * @returns True if the presenter matches
   */
  public matches(route: string, contentType: string, tenant?: string): boolean {
    const routeMatch = this.route === route || this.route === '*' || route.startsWith(this.route);
    const contentTypeMatch = this.contentType === contentType || this.contentType === '*';
    const tenantMatch = !this.tenant || !tenant || this.tenant === tenant;
    
    return routeMatch && contentTypeMatch && tenantMatch;
  }

  /**
   * Get the presenter's display name for debugging
   * @returns formatted display name
   */
  public getDisplayName(): string {
    return `Presenter(${this.name}, ${this.route}, ${this.contentType})`;
  }

  /**
   * Create a new presenter by prepending phase sets
   * @param plugins - plugins to prepend phase sets of
   * @returns new presenter with prepended phases
   */
  public prependPhaseSets(plugins: Plugin[]): Presenter {
    const combinedPhaseSet = plugins.reduce((acc, plugin) => {
      return acc.prepend(plugin.phaseSet);
    }, this.phaseSet);

    return new Presenter(
      this.name,
      this.route,
      this.contentType,
      combinedPhaseSet,
      this.component!,
      this.tenant
    );
  }

  /**
   * Create a new presenter by appending phase sets
   * @param plugins - plugins to append phase sets of
   * @returns new presenter with appended phases
   */
  public appendPhaseSets(plugins: Plugin[]): Presenter {
    const combinedPhaseSet = plugins.reduce((acc, plugin) => {
      return acc.append(plugin.phaseSet);
    }, this.phaseSet);

    return new Presenter(
      this.name,
      this.route,
      this.contentType,
      combinedPhaseSet,
      this.component!,
      this.tenant
    );
  }

  /**
   * Clone the presenter with new properties
   * @param overrides - Properties to override
   * @returns new presenter instance
   */
  public clone(overrides: Partial<Pick<Presenter, 'name' | 'route' | 'contentType' | 'component' | 'phaseSet' | 'tenant'>> = {}): Presenter {
    return new Presenter(
      overrides.name ?? this.name,
      overrides.route ?? this.route,
      overrides.contentType ?? this.contentType,
      overrides.phaseSet ?? this.phaseSet,
      overrides.component ?? this.component!,
      overrides.tenant ?? this.tenant
    );
  }
}

/**
 * Create a presenter for articles
 * @param name - The presenter name
 * @param route - The route pattern
 * @param component - The React component
 * @param phaseSet - The phase set
 * @param tenant - The tenant (optional)
 * @returns Presenter instance
 */
export function createArticlePresenter(
  name: string,
  route: string,
  component: ComponentType,
  phaseSet: PhaseSet,
  tenant?: string
): Presenter {
  return new Presenter(name, route, 'article', phaseSet, component, tenant);
}

/**
 * Create a presenter for bundles
 * @param name - The presenter name
 * @param route - The route pattern
 * @param component - The React component
 * @param phaseSet - The phase set
 * @param tenant - The tenant (optional)
 * @returns Presenter instance
 */
export function createBundlePresenter(
  name: string,
  route: string,
  component: ComponentType,
  phaseSet: PhaseSet,
  tenant?: string
): Presenter {
  return new Presenter(name, route, 'bundle', phaseSet, component, tenant);
}

/**
 * Create a presenter for search
 * @param name - The presenter name
 * @param route - The route pattern
 * @param component - The React component
 * @param phaseSet - The phase set
 * @param tenant - The tenant (optional)
 * @returns Presenter instance
 */
export function createSearchPresenter(
  name: string,
  route: string,
  component: ComponentType,
  phaseSet: PhaseSet,
  tenant?: string
): Presenter {
  return new Presenter(name, route, 'search', phaseSet, component, tenant);
}

/**
 * Create a presenter for collections
 * @param name - The presenter name
 * @param route - The route pattern
 * @param component - The React component
 * @param phaseSet - The phase set
 * @param tenant - The tenant (optional)
 * @returns Presenter instance
 */
export function createCollectionPresenter(
  name: string,
  route: string,
  component: ComponentType,
  phaseSet: PhaseSet,
  tenant?: string
): Presenter {
  return new Presenter(name, route, 'collection', phaseSet, component, tenant);
}
