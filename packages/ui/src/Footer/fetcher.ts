import { TenantTheme, FooterLink } from './Footer';
import { defaultTheme } from '../theme';

export interface FooterData {
  tenantTheme: TenantTheme;
  links: FooterLink[];
  copyright: string;
}

export const fetchFooterData = async (
  tenantId?: string
): Promise<FooterData> => {
  const defaultLinks: FooterLink[] = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact', href: '/contact' },
    { label: 'Help', href: '/help' },
  ];

  return {
    tenantTheme: defaultTheme,
    links: defaultLinks,
    copyright: '© 2024 LuxGen. All rights reserved.',
  };
};

export const fetchFooterSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchFooterData(tenantId);
  
  const linksHtml = data.links
    .map(link => `<a href="${link.href}" class="footer-link">${link.label}</a>`)
    .join('');
  
  const html = `
    <footer class="footer" style="background-color: ${data.tenantTheme.colors.surface}; border-top: 1px solid ${data.tenantTheme.colors.border}; color: ${data.tenantTheme.colors.textSecondary}; font-family: ${data.tenantTheme.fonts.primary};">
      <div class="footer-container">
        <div class="footer-content">
          <nav class="footer-nav">${linksHtml}</nav>
          <div class="footer-copyright">
            <p>${data.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  `;
  
  const styles = `
    .footer {
      margin-top: auto;
      padding: 2rem 0;
    }
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .footer-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
      text-align: center;
    }
    .footer-nav {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .footer-link {
      color: inherit;
      text-decoration: none;
      font-size: 0.875rem;
    }
    .footer-link:hover {
      color: var(--color-primary);
    }
    .footer-copyright p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
  `;
  
  return { html, styles };
};
