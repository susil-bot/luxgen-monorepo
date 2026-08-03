# Navigation Architecture Technical Specification
## Robust, Scalable, Modular Navigation System

---

## 🏗️ **System Architecture Overview**

### **High-Level Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Navigation System Architecture                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Presentation  │    │   Business      │    │   Data      │ │
│  │   Layer         │    │   Logic Layer   │    │   Layer     │ │
│  │                 │    │                 │    │             │ │
│  │ • NavBar        │◄──►│ • Permission    │◄──►│ • User      │ │
│  │ • Sidebar       │    │   Engine        │    │   Context   │ │
│  │ • Breadcrumb   │    │ • Menu Builder  │    │ • Role      │ │
│  │ • Mobile Nav    │    │ • Route Guard   │    │   Data      │ │
│  │ • Layouts       │    │ • Navigation    │    │ • Theme     │ │
│  │                 │    │   Context       │    │   Data      │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Integration   │    │   Utilities     │    │   Config    │ │
│  │   Layer         │    │   Layer         │    │   Layer     │ │
│  │                 │    │                 │    │             │ │
│  │ • Router        │    │ • Permission    │    │ • Menu      │ │
│  │ • Theme         │    │   Utils         │    │   Config    │ │
│  │ • Analytics     │    │ • Navigation    │    │ • Role      │ │
│  │ • Storage       │    │   Utils         │    │   Config    │ │
│  │                 │    │ • Layout Utils  │    │ • Layout    │ │
│  └─────────────────┘    └─────────────────┘    │   Config    │ │
│                                                 └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 **Component Architecture**

### **1. Permission System**

#### **Permission Types**
```typescript
export enum Permission {
  // Basic CRUD operations
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  
  // Administrative permissions
  ADMIN = 'admin',
  MANAGE_USERS = 'manage_users',
  MANAGE_CONTENT = 'manage_content',
  MANAGE_SETTINGS = 'manage_settings',
  
  // Feature-specific permissions
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_BILLING = 'manage_billing',
  EXPORT_DATA = 'export_data',
  IMPORT_DATA = 'import_data',
  
  // Navigation-specific permissions
  VIEW_ADMIN_PANEL = 'view_admin_panel',
  VIEW_USER_DASHBOARD = 'view_user_dashboard',
  MANAGE_NAVIGATION = 'manage_navigation'
}
```

#### **Role Hierarchy**
```typescript
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',    // Full system access
  ADMIN = 'ADMIN',                // Tenant-level admin
  USER = 'USER'                   // Standard user
}

export const ROLE_HIERARCHY = {
  [UserRole.SUPER_ADMIN]: 3,
  [UserRole.ADMIN]: 2,
  [UserRole.USER]: 1
}
```

#### **Permission Matrix**
```typescript
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN,
    Permission.MANAGE_USERS, Permission.MANAGE_CONTENT, Permission.MANAGE_SETTINGS,
    Permission.VIEW_ANALYTICS, Permission.MANAGE_BILLING, Permission.EXPORT_DATA,
    Permission.IMPORT_DATA, Permission.VIEW_ADMIN_PANEL, Permission.VIEW_USER_DASHBOARD,
    Permission.MANAGE_NAVIGATION
  ],
  [UserRole.ADMIN]: [
    Permission.READ, Permission.WRITE, Permission.MANAGE_CONTENT,
    Permission.VIEW_ANALYTICS, Permission.VIEW_ADMIN_PANEL, Permission.VIEW_USER_DASHBOARD
  ],
  [UserRole.USER]: [
    Permission.READ, Permission.VIEW_USER_DASHBOARD
  ]
}
```

### **2. Navigation Context System**

#### **Navigation Context Interface**
```typescript
interface NavigationContextType {
  // Current state
  currentRoute: string;
  navigationHistory: string[];
  activeMenuItems: string[];
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  
  // User context
  userRole: UserRole;
  userPermissions: Permission[];
  currentTenant: string;
  
  // Navigation actions
  setCurrentRoute: (route: string) => void;
  addToHistory: (route: string) => void;
  setActiveMenuItems: (items: string[]) => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  
  // Menu building
  getMenuItemsForRole: (role: UserRole) => MenuItem[];
  getSidebarSectionsForRole: (role: UserRole) => SidebarSection[];
}
```

### **3. Menu Builder System**

#### **Menu Configuration Structure**
```typescript
interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: MenuItem[];
  external?: boolean;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
  
  // Permission-based visibility
  requiredPermissions?: Permission[];
  requiredRole?: UserRole;
  visibleForRoles?: UserRole[];
  
  // Conditional visibility
  showWhen?: (context: NavigationContextType) => boolean;
  hideWhen?: (context: NavigationContextType) => boolean;
}

interface SidebarSection {
  id: string;
  title?: string;
  items: MenuItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  
  // Permission-based visibility
  requiredPermissions?: Permission[];
  requiredRole?: UserRole;
  visibleForRoles?: UserRole[];
}
```

#### **Menu Builder Implementation**
```typescript
class MenuBuilder {
  static buildForRole(role: UserRole, tenant: string): MenuItem[] {
    const baseMenuItems = this.getBaseMenuItems();
    const roleSpecificItems = this.getRoleSpecificItems(role);
    const tenantSpecificItems = this.getTenantSpecificItems(tenant);
    
    return this.mergeAndFilterMenuItems([
      ...baseMenuItems,
      ...roleSpecificItems,
      ...tenantSpecificItems
    ], role);
  }
  
  static filterByPermissions(items: MenuItem[], permissions: Permission[]): MenuItem[] {
    return items.filter(item => {
      if (!item.requiredPermissions) return true;
      return item.requiredPermissions.every(permission => 
        permissions.includes(permission)
      );
    });
  }
  
  static addRoleSpecificItems(items: MenuItem[], role: UserRole): MenuItem[] {
    const roleItems = ROLE_MENU_ITEMS[role] || [];
    return [...items, ...roleItems];
  }
}
```

### **4. Layout System**

#### **Layout Types**
```typescript
interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  tenantTheme: TenantTheme;
  className?: string;
}

// Admin Layout - Full sidebar, admin navigation
export const AdminLayout: React.FC<LayoutProps> = ({ children, userRole, tenantTheme }) => {
  return (
    <div className="admin-layout">
      <AdminNavBar userRole={userRole} tenantTheme={tenantTheme} />
      <AdminSidebar userRole={userRole} tenantTheme={tenantTheme} />
      <main className="admin-content">
        <Breadcrumb />
        {children}
      </main>
    </div>
  );
};

// User Layout - Simplified sidebar, user navigation
export const UserLayout: React.FC<LayoutProps> = ({ children, userRole, tenantTheme }) => {
  return (
    <div className="user-layout">
      <UserNavBar userRole={userRole} tenantTheme={tenantTheme} />
      <UserSidebar userRole={userRole} tenantTheme={tenantTheme} />
      <main className="user-content">
        <Breadcrumb />
        {children}
      </main>
    </div>
  );
};

// SuperAdmin Layout - Full access, system-wide navigation
export const SuperAdminLayout: React.FC<LayoutProps> = ({ children, userRole, tenantTheme }) => {
  return (
    <div className="superadmin-layout">
      <SuperAdminNavBar userRole={userRole} tenantTheme={tenantTheme} />
      <SuperAdminSidebar userRole={userRole} tenantTheme={tenantTheme} />
      <main className="superadmin-content">
        <Breadcrumb />
        {children}
      </main>
    </div>
  );
};
```

#### **Layout Manager**
```typescript
interface LayoutManagerProps {
  children: React.ReactNode;
  userRole: UserRole;
  tenantTheme: TenantTheme;
  layoutType?: 'auto' | 'admin' | 'user' | 'superadmin';
}

export const LayoutManager: React.FC<LayoutManagerProps> = ({
  children,
  userRole,
  tenantTheme,
  layoutType = 'auto'
}) => {
  const getLayoutComponent = () => {
    if (layoutType !== 'auto') {
      switch (layoutType) {
        case 'admin': return AdminLayout;
        case 'user': return UserLayout;
        case 'superadmin': return SuperAdminLayout;
        default: return UserLayout;
      }
    }
    
    // Auto-detect layout based on role
    switch (userRole) {
      case UserRole.SUPER_ADMIN: return SuperAdminLayout;
      case UserRole.ADMIN: return AdminLayout;
      case UserRole.USER: return UserLayout;
      default: return UserLayout;
    }
  };
  
  const LayoutComponent = getLayoutComponent();
  
  return (
    <LayoutComponent userRole={userRole} tenantTheme={tenantTheme}>
      {children}
    </LayoutComponent>
  );
};
```

### **5. Route Guard System**

#### **Route Guard Implementation**
```typescript
interface RouteGuardProps {
  requiredPermissions?: Permission[];
  requiredRole?: UserRole;
  fallbackRoute?: string;
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  requiredPermissions = [],
  requiredRole,
  fallbackRoute = '/unauthorized',
  children
}) => {
  const { userRole, hasPermission, hasAnyPermission } = useNavigation();
  
  // Check role requirement
  if (requiredRole && ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[requiredRole]) {
    return <Navigate to={fallbackRoute} replace />;
  }
  
  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasRequiredPermissions) {
      return <Navigate to={fallbackRoute} replace />;
    }
  }
  
  return <>{children}</>;
};
```

### **6. Responsive Design System**

#### **Breakpoint Configuration**
```typescript
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280
} as const;

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop' | 'wide'>('desktop');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.mobile) setScreenSize('mobile');
      else if (width < BREAKPOINTS.tablet) setScreenSize('tablet');
      else if (width < BREAKPOINTS.desktop) setScreenSize('desktop');
      else setScreenSize('wide');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    screenSize,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    isWide: screenSize === 'wide'
  };
};
```

---

## 📱 **Mobile Navigation Architecture**

### **Mobile Navigation Drawer**
```typescript
interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  tenantTheme: TenantTheme;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  userRole,
  tenantTheme
}) => {
  const { getMenuItemsForRole } = useNavigation();
  const menuItems = getMenuItemsForRole(userRole);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          className="mobile-navigation-drawer"
        >
          <MobileNavHeader onClose={onClose} />
          <MobileNavMenu items={menuItems} />
          <MobileNavFooter userRole={userRole} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

---

## 🎨 **Theme Integration**

### **Multi-Tenant Theme Support**
```typescript
interface NavigationTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    hover: string;
    active: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
}

export const useNavigationTheme = (tenantTheme: TenantTheme): NavigationTheme => {
  return {
    colors: {
      primary: tenantTheme.colors.primary || '#3B82F6',
      secondary: tenantTheme.colors.secondary || '#6B7280',
      background: tenantTheme.colors.background || '#FFFFFF',
      surface: tenantTheme.colors.surface || '#F9FAFB',
      text: tenantTheme.colors.text || '#111827',
      textSecondary: tenantTheme.colors.textSecondary || '#6B7280',
      border: tenantTheme.colors.border || '#E5E7EB',
      hover: tenantTheme.colors.hover || '#F3F4F6',
      active: tenantTheme.colors.active || '#3B82F6'
    },
    // ... other theme properties
  };
};
```

---

## 🚀 **Performance Optimization**

### **Lazy Loading Strategy**
```typescript
// Lazy load layout components
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const UserLayout = lazy(() => import('./layouts/UserLayout'));
const SuperAdminLayout = lazy(() => import('./layouts/SuperAdminLayout'));

// Lazy load navigation components
const MobileNavigation = lazy(() => import('./components/MobileNavigation'));
const Breadcrumb = lazy(() => import('./components/Breadcrumb'));

// Memoized menu items
const MemoizedMenuItems = memo(({ items, userRole }: { items: MenuItem[], userRole: UserRole }) => {
  return (
    <ul>
      {items.map(item => (
        <MenuItem key={item.id} item={item} userRole={userRole} />
      ))}
    </ul>
  );
});
```

### **Caching Strategy**
```typescript
// Cache menu items by role
const menuCache = new Map<UserRole, MenuItem[]>();

export const getCachedMenuItems = (role: UserRole): MenuItem[] => {
  if (menuCache.has(role)) {
    return menuCache.get(role)!;
  }
  
  const menuItems = MenuBuilder.buildForRole(role, getCurrentTenant());
  menuCache.set(role, menuItems);
  return menuItems;
};

// Cache permissions by role
const permissionCache = new Map<UserRole, Permission[]>();

export const getCachedPermissions = (role: UserRole): Permission[] => {
  if (permissionCache.has(role)) {
    return permissionCache.get(role)!;
  }
  
  const permissions = ROLE_PERMISSIONS[role] || [];
  permissionCache.set(role, permissions);
  return permissions;
};
```

---

## 🔒 **Security Considerations**

### **Permission Validation**
```typescript
// Server-side permission validation
export const validatePermissions = async (
  userId: string,
  requiredPermissions: Permission[]
): Promise<boolean> => {
  const user = await getUserById(userId);
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
};

// Client-side permission checking (for UI only)
export const checkClientPermissions = (
  userRole: UserRole,
  requiredPermissions: Permission[]
): boolean => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
};
```

### **Route Protection**
```typescript
// Protected route wrapper
export const withRouteProtection = (
  Component: React.ComponentType,
  requiredPermissions: Permission[],
  requiredRole?: UserRole
) => {
  return (props: any) => {
    const { userRole, hasPermission } = useNavigation();
    
    // Check role requirement
    if (requiredRole && ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[requiredRole]) {
      return <UnauthorizedPage />;
    }
    
    // Check permission requirements
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasRequiredPermissions) {
      return <UnauthorizedPage />;
    }
    
    return <Component {...props} />;
  };
};
```

---

## 📊 **Analytics & Monitoring**

### **Navigation Analytics**
```typescript
interface NavigationEvent {
  type: 'navigation' | 'menu_click' | 'sidebar_toggle' | 'search';
  route: string;
  userRole: UserRole;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export const trackNavigationEvent = (event: NavigationEvent) => {
  // Send to analytics service
  analytics.track('navigation_event', {
    ...event,
    tenant: getCurrentTenant(),
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`
  });
};

// Performance monitoring
export const measureNavigationPerformance = (route: string) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      analytics.track('navigation_performance', {
        route,
        duration,
        timestamp: new Date()
      });
    }
  };
};
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
```typescript
// Permission system tests
describe('Permission System', () => {
  test('should return correct permissions for SUPER_ADMIN', () => {
    const permissions = ROLE_PERMISSIONS[UserRole.SUPER_ADMIN];
    expect(permissions).toContain(Permission.ADMIN);
    expect(permissions).toContain(Permission.MANAGE_USERS);
  });
  
  test('should check permissions correctly', () => {
    expect(hasPermission(UserRole.ADMIN, Permission.READ)).toBe(true);
    expect(hasPermission(UserRole.USER, Permission.ADMIN)).toBe(false);
  });
});

// Menu builder tests
describe('Menu Builder', () => {
  test('should build correct menu for ADMIN role', () => {
    const menuItems = MenuBuilder.buildForRole(UserRole.ADMIN, 'demo');
    expect(menuItems).toHaveLength(5);
    expect(menuItems[0].id).toBe('dashboard');
  });
});
```

### **Integration Tests**
```typescript
// Navigation flow tests
describe('Navigation Flow', () => {
  test('should navigate correctly for different roles', async () => {
    const { user } = renderWithNavigation(<App />, { role: UserRole.ADMIN });
    
    await user.click(screen.getByText('Admin Panel'));
    expect(mockRouter.push).toHaveBeenCalledWith('/admin');
  });
});
```

---

## 📚 **Documentation Requirements**

### **API Documentation**
- [ ] NavigationContext API reference
- [ ] MenuBuilder usage examples
- [ ] Layout components props documentation
- [ ] Permission system usage guide
- [ ] Route guard implementation guide

### **Architecture Documentation**
- [ ] System architecture diagrams
- [ ] Component relationship diagrams
- [ ] Data flow documentation
- [ ] Security considerations
- [ ] Performance optimization guide

### **Migration Documentation**
- [ ] Migration guide from current system
- [ ] Breaking changes documentation
- [ ] Upgrade path documentation
- [ ] Rollback procedures

---

*This technical specification will be updated as we progress through implementation and discover new requirements.*

