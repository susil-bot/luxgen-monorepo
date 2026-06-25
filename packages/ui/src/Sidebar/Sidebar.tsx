import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { withSSR } from '../ssr';
import { useGlobalContext } from '../context/GlobalContext';
import { useUser } from '../context/UserContext';
import { useNavigation } from '../context/NavigationContext';
import { useSidebarActive } from './useSidebarActive';
import { LuxSidebarNavItem } from './LuxSidebarNavItem';
import type { NavSection } from './sidebar.types';

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: SidebarItem[];
  external?: boolean;
  disabled?: boolean;
  active?: boolean;
  /** Require exact pathname match for active state (e.g. dashboard) */
  exact?: boolean;
  onClick?: () => void;
}

export interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  showTitle?: boolean;
  separator?: boolean;
}

export interface SidebarProps {
  sections?: SidebarSection[];
  logo?: {
    src?: string;
    alt?: string;
    text?: string;
    href?: string;
  };
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onUserAction?: (action: 'profile' | 'settings' | 'logout') => void;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  position?: 'fixed' | 'sticky' | 'static';
  width?: 'narrow' | 'normal' | 'wide';
  showUserSection?: boolean;
  showLogo?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  onItemClick?: (item: SidebarItem) => void;
  pathname?: string;
  onNavigate?: (href: string) => void;
}

function hasActiveDescendant(item: SidebarItem, isItemActive: (id: string) => boolean): boolean {
  if (!item.children?.length) return false;
  return item.children.some((child) => isItemActive(child.id) || hasActiveDescendant(child, isItemActive));
}

const SidebarComponent: React.FC<SidebarProps> = ({
  sections = [],
  logo,
  user = null,
  onUserAction,
  className = '',
  showUserSection = true,
  showLogo = true,
  collapsible = true,
  defaultCollapsed = false,
  onToggle,
  onItemClick,
  pathname,
  onNavigate,
  ...props
}) => {
  const navigation = useNavigation();
  const effectivePathname = pathname ?? navigation.pathname ?? '';
  const effectiveNavigate = onNavigate ?? navigation.onNavigate;

  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => {
      if (mq.matches) {
        setIsCollapsed(true);
        setMobileOpen(false);
      }
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    sections.forEach((section) => {
      if (!section.defaultCollapsed && section.collapsible !== false) {
        initial.add(section.id);
      }
    });
    return initial;
  });

  const navSections = useMemo(() => sections as unknown as NavSection[], [sections]);
  const { activeItemId, expandedByUrl } = useSidebarActive(navSections, effectivePathname);
  const urlDrivenActive = Boolean(effectivePathname);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => new Set(expandedByUrl));

  const { tenantConfig } = useGlobalContext();
  const { user: dynamicUser } = useUser();
  const tenantLogoRaw = logo ?? tenantConfig.branding.logo;
  const logoText = 'text' in tenantLogoRaw && tenantLogoRaw.text ? tenantLogoRaw.text : 'LuxGen';
  const logoSrc =
    ('src' in tenantLogoRaw && tenantLogoRaw.src) || ('image' in tenantLogoRaw && tenantLogoRaw.image) || undefined;
  const logoHref = 'href' in tenantLogoRaw ? tenantLogoRaw.href : '/';
  const currentUser = dynamicUser || user;

  useEffect(() => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      expandedByUrl.forEach((id) => next.add(id));
      return next;
    });
  }, [expandedByUrl]);

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggle?.(newCollapsed);
  };

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const handleItemToggle = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const navigateTo = useCallback(
    (href: string, external?: boolean) => {
      if (external) {
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
      }
      if (effectiveNavigate) {
        effectiveNavigate(href);
      } else {
        window.location.href = href;
      }
    },
    [effectiveNavigate],
  );

  const handleItemClick = (item: SidebarItem) => {
    onItemClick?.(item);
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      navigateTo(item.href, item.external);
    }
  };

  const isItemActive = useCallback(
    (itemId: string) => (urlDrivenActive ? activeItemId === itemId : false),
    [urlDrivenActive, activeItemId],
  );

  const handleUserAction = (action: 'profile' | 'settings' | 'logout') => {
    onUserAction?.(action);
  };

  const userInitials =
    currentUser?.name
      ?.split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? '?';

  const userAvatar =
    currentUser && 'avatarUrl' in currentUser && currentUser.avatarUrl
      ? currentUser.avatarUrl
      : currentUser && 'avatar' in currentUser && typeof currentUser.avatar === 'string'
        ? currentUser.avatar
        : undefined;

  return (
    <aside className={`lux-sidebar ${className}`.trim()} data-collapsed={isCollapsed ? 'true' : 'false'} {...props}>
      <div className="lux-sidebar__body">
        {showLogo && (
          <div className="lux-sidebar-header">
            <div className="lux-sidebar-header__avatar" aria-hidden>
              {logoSrc ? (
                <img src={logoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                logoText.charAt(0).toUpperCase()
              )}
            </div>
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => logoHref && navigateTo(logoHref)}
                className="lux-sidebar-header__info"
                style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left' }}
              >
                <span className="lux-sidebar-header__name">{logoText}</span>
              </button>
            )}
            {collapsible ? (
              <button
                type="button"
                onClick={handleToggle}
                className="lux-sidebar-header__collapse"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg viewBox="0 0 20 20" fill="none" width={16} height={16} aria-hidden>
                  <path
                    d={isCollapsed ? 'M7 5l5 5-5 5' : 'M13 5l-5 5 5 5'}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        )}

        <nav className="lux-sidebar-nav" aria-label="Main navigation">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="lux-sidebar-section">
              {section.separator && sectionIndex > 0 ? <div className="lux-separator" /> : null}

              {section.title && !isCollapsed && (section.showTitle ?? section.title !== 'Navigation') ? (
                <div className="lux-sidebar-section__header">
                  <span className="lux-sidebar-section__title">{section.title}</span>
                  {section.collapsible !== false ? (
                    <button
                      type="button"
                      onClick={() => handleSectionToggle(section.id)}
                      className="lux-sidebar-section__toggle"
                      aria-expanded={expandedSections.has(section.id)}
                    >
                      <NavChevronSmall open={expandedSections.has(section.id)} />
                    </button>
                  ) : null}
                </div>
              ) : null}

              {(!section.collapsible || expandedSections.has(section.id) || isCollapsed) && (
                <div className="lux-sidebar-section__items">
                  {section.items.map((item) => (
                    <LuxSidebarNavItem
                      key={item.id}
                      item={item}
                      isActive={isItemActive(item.id)}
                      isAncestorActive={hasActiveDescendant(item, isItemActive)}
                      isExpanded={expandedItems.has(item.id)}
                      isCollapsed={isCollapsed}
                      onToggle={handleItemToggle}
                      onItemClick={handleItemClick}
                      isItemActive={isItemActive}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {showUserSection && !isCollapsed ? (
          currentUser ? (
            <div className="lux-sidebar-footer">
              <button type="button" className="lux-sidebar-footer__user" onClick={() => handleUserAction('profile')}>
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="lux-sidebar-footer__avatar" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="lux-sidebar-footer__avatar">{userInitials}</div>
                )}
                <div className="lux-sidebar-footer__name">
                  <span>{currentUser.name}</span>
                  {currentUser.role ? <span className="lux-sidebar-header__sub">{currentUser.role}</span> : null}
                </div>
              </button>
            </div>
          ) : (
            <div className="lux-sidebar-footer lux-sidebar-footer--guest">
              <button type="button" className="lux-sidebar-footer__sign-in" onClick={() => navigateTo('/login')}>
                Sign in
              </button>
            </div>
          )
        ) : null}
      </div>
    </aside>
  );
};

function NavChevronSmall({ open }: { open: boolean }) {
  return (
    <svg
      className={`lux-nav-item__chevron ${open ? 'lux-nav-item__chevron--open' : ''}`}
      viewBox="0 0 16 16"
      fill="none"
      width={14}
      height={14}
      aria-hidden
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const Sidebar = withSSR(SidebarComponent);
