import { Plugin } from '../Plugin';
import { PhaseSet } from '../PhaseSet';
import { createFetcher, createTransformer } from '../index';

/**
 * NavigationPlugin is a shared plugin that manages site navigation.
 * It fetches navigation data and transforms it for the navigation component.
 */
export class NavigationPlugin extends Plugin {
  constructor() {
    const phaseSet = new PhaseSet(
      [
        // Fetchers
        createFetcher('navigationData', async (workflowContext) => {
          const { tenant } = workflowContext;
          
          // Base navigation structure
          const baseNavigation = {
            main: [
              { label: 'Home', href: '/', active: true },
              { label: 'About', href: '/about' },
              { label: 'Services', href: '/services' },
              { label: 'Contact', href: '/contact' },
            ],
            footer: [
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Cookie Policy', href: '/cookies' },
            ],
            social: [
              { label: 'Twitter', href: 'https://twitter.com/luxgen', icon: 'twitter' },
              { label: 'LinkedIn', href: 'https://linkedin.com/company/luxgen', icon: 'linkedin' },
              { label: 'GitHub', href: 'https://github.com/luxgen', icon: 'github' },
            ],
          };

          // Tenant-specific navigation overrides
          if (tenant) {
            const tenantNavigation = await this.getTenantNavigation(tenant);
            return { ...baseNavigation, ...tenantNavigation };
          }

          return baseNavigation;
        }),
        createFetcher('userNavigation', async (workflowContext) => {
          const { user } = workflowContext;
          
          if (!user) {
            return {
              authenticated: false,
              items: [
                { label: 'Login', href: '/login' },
                { label: 'Register', href: '/register' },
              ],
            };
          }

          return {
            authenticated: true,
            user: {
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            },
            items: [
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Profile', href: '/profile' },
              { label: 'Settings', href: '/settings' },
              { label: 'Logout', href: '/logout' },
            ],
          };
        }),
      ],
      [
        // Transformers
        createTransformer('navigationMenu', (workflowContext) => {
          const navigationData = workflowContext.fetched.navigationData;
          const userNavigation = workflowContext.fetched.userNavigation;
          
          return {
            main: navigationData.main,
            footer: navigationData.footer,
            social: navigationData.social,
            user: userNavigation,
            breadcrumbs: this.generateBreadcrumbs(workflowContext),
          };
        }),
        createTransformer('mobileNavigation', (workflowContext) => {
          const navigationData = workflowContext.fetched.navigationData;
          const userNavigation = workflowContext.fetched.userNavigation;
          
          return {
            isOpen: false,
            items: [
              ...navigationData.main,
              ...(userNavigation.authenticated ? userNavigation.items : []),
            ],
          };
        }),
      ]
    );

    super('plugin-navigation', phaseSet);
  }

  /**
   * Get tenant-specific navigation configuration
   * @param tenant - The tenant identifier
   * @returns Tenant-specific navigation data
   */
  private async getTenantNavigation(tenant: string): Promise<any> {
    // This would typically fetch from a database or configuration service
    const tenantConfigs: Record<string, any> = {
      'luxgen': {
        main: [
          { label: 'Home', href: '/', active: true },
          { label: 'Products', href: '/products' },
          { label: 'Solutions', href: '/solutions' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
      'demo': {
        main: [
          { label: 'Demo', href: '/demo', active: true },
          { label: 'Features', href: '/features' },
          { label: 'Pricing', href: '/pricing' },
        ],
      },
    };

    return tenantConfigs[tenant] || {};
  }

  /**
   * Generate breadcrumbs based on the current route
   * @param workflowContext - The workflow context
   * @returns Breadcrumb array
   */
  private generateBreadcrumbs(workflowContext: WorkflowContext): Array<{ label: string; href: string }> {
    const { request } = workflowContext;
    const path = request?.path || '/';
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [{ label: 'Home', href: '/' }];
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
      });
    });

    return breadcrumbs;
  }
}
