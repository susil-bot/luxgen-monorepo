# Navigation Architecture Quick Start
## Immediate Implementation Plan

---

## 🚀 **Phase 1: Foundation (Days 1-3)**

### **Day 1: Permission System Setup**

#### **Step 1: Create Permission Types**
```bash
# Create the permission system files
mkdir -p packages/ui/src/navigation
touch packages/ui/src/navigation/types.ts
touch packages/ui/src/navigation/permissions.ts
touch packages/ui/src/navigation/roles.ts
```

#### **Step 2: Implement Core Permission Logic**
```typescript
// packages/ui/src/navigation/types.ts
export enum Permission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
  MANAGE_USERS = 'manage_users',
  MANAGE_CONTENT = 'manage_content',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SETTINGS = 'manage_settings'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER'
}
```

#### **Step 3: Create Permission Matrix**
```typescript
// packages/ui/src/navigation/permissions.ts
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN,
    Permission.MANAGE_USERS, Permission.MANAGE_CONTENT, Permission.VIEW_ANALYTICS,
    Permission.MANAGE_SETTINGS
  ],
  [UserRole.ADMIN]: [
    Permission.READ, Permission.WRITE, Permission.MANAGE_CONTENT, Permission.VIEW_ANALYTICS
  ],
  [UserRole.USER]: [Permission.READ]
};

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};
```

### **Day 2: Navigation Context Setup**

#### **Step 1: Create Navigation Context**
```bash
touch packages/ui/src/navigation/NavigationContext.tsx
touch packages/ui/src/navigation/NavigationProvider.tsx
```

#### **Step 2: Implement Navigation Context**
```typescript
// packages/ui/src/navigation/NavigationContext.tsx
import { createContext, useContext } from 'react';
import { UserRole, Permission } from './types';

interface NavigationContextType {
  currentRoute: string;
  userRole: UserRole;
  userPermissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  setCurrentRoute: (route: string) => void;
}

export const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
```

#### **Step 3: Create Navigation Provider**
```typescript
// packages/ui/src/navigation/NavigationProvider.tsx
import React, { useState } from 'react';
import { NavigationContext } from './NavigationContext';
import { UserRole, Permission, ROLE_PERMISSIONS, hasPermission } from './permissions';

interface NavigationProviderProps {
  children: React.ReactNode;
  userRole: UserRole;
  initialRoute?: string;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  userRole,
  initialRoute = '/'
}) => {
  const [currentRoute, setCurrentRoute] = useState(initialRoute);
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];

  const contextValue = {
    currentRoute,
    userRole,
    userPermissions,
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    setCurrentRoute
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};
```

### **Day 3: Menu Builder Implementation**

#### **Step 1: Create Menu Builder**
```bash
touch packages/ui/src/navigation/MenuBuilder.ts
touch packages/ui/src/navigation/menuConfig.ts
```

#### **Step 2: Define Menu Configuration**
```typescript
// packages/ui/src/navigation/menuConfig.ts
import { UserRole, Permission } from './types';

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  requiredPermissions?: Permission[];
  visibleForRoles?: UserRole[];
}

export const BASE_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    visibleForRoles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    visibleForRoles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]
  }
];

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    id: 'admin-panel',
    label: 'Admin Panel',
    href: '/admin',
    requiredPermissions: [Permission.ADMIN],
    visibleForRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
  },
  {
    id: 'user-management',
    label: 'User Management',
    href: '/admin/users',
    requiredPermissions: [Permission.MANAGE_USERS],
    visibleForRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
  }
];

export const SUPER_ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    id: 'system-settings',
    label: 'System Settings',
    href: '/superadmin/settings',
    requiredPermissions: [Permission.MANAGE_SETTINGS],
    visibleForRoles: [UserRole.SUPER_ADMIN]
  }
];
```

#### **Step 3: Implement Menu Builder**
```typescript
// packages/ui/src/navigation/MenuBuilder.ts
import { MenuItem, BASE_MENU_ITEMS, ADMIN_MENU_ITEMS, SUPER_ADMIN_MENU_ITEMS } from './menuConfig';
import { UserRole, Permission, ROLE_PERMISSIONS } from './permissions';

export class MenuBuilder {
  static buildForRole(role: UserRole): MenuItem[] {
    const allMenuItems = [
      ...BASE_MENU_ITEMS,
      ...ADMIN_MENU_ITEMS,
      ...SUPER_ADMIN_MENU_ITEMS
    ];

    return this.filterMenuItemsForRole(allMenuItems, role);
  }

  static filterMenuItemsForRole(items: MenuItem[], role: UserRole): MenuItem[] {
    const userPermissions = ROLE_PERMISSIONS[role] || [];

    return items.filter(item => {
      // Check role visibility
      if (item.visibleForRoles && !item.visibleForRoles.includes(role)) {
        return false;
      }

      // Check permission requirements
      if (item.requiredPermissions) {
        return item.requiredPermissions.every(permission =>
          userPermissions.includes(permission)
        );
      }

      return true;
    });
  }
}
```

---

## 🏗️ **Phase 2: Layout System (Days 4-6)**

### **Day 4: Layout Manager**

#### **Step 1: Create Layout Components**
```bash
mkdir -p packages/ui/src/layouts
touch packages/ui/src/layouts/LayoutManager.tsx
touch packages/ui/src/layouts/AdminLayout.tsx
touch packages/ui/src/layouts/UserLayout.tsx
touch packages/ui/src/layouts/SuperAdminLayout.tsx
```

#### **Step 2: Implement Layout Manager**
```typescript
// packages/ui/src/layouts/LayoutManager.tsx
import React from 'react';
import { UserRole } from '../navigation/types';
import { AdminLayout } from './AdminLayout';
import { UserLayout } from './UserLayout';
import { SuperAdminLayout } from './SuperAdminLayout';

interface LayoutManagerProps {
  children: React.ReactNode;
  userRole: UserRole;
  layoutType?: 'auto' | 'admin' | 'user' | 'superadmin';
}

export const LayoutManager: React.FC<LayoutManagerProps> = ({
  children,
  userRole,
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
    <LayoutComponent userRole={userRole}>
      {children}
    </LayoutComponent>
  );
};
```

### **Day 5: Role-Based Layouts**

#### **Step 1: Implement Admin Layout**
```typescript
// packages/ui/src/layouts/AdminLayout.tsx
import React from 'react';
import { UserRole } from '../navigation/types';
import { NavBar } from '../NavBar/NavBar';
import { Sidebar } from '../Sidebar/Sidebar';
import { MenuBuilder } from '../navigation/MenuBuilder';

interface AdminLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, userRole }) => {
  const menuItems = MenuBuilder.buildForRole(userRole);

  return (
    <div className="admin-layout flex h-screen">
      <Sidebar 
        sections={[{ id: 'main', items: menuItems }]}
        userRole={userRole}
        variant="default"
        width="normal"
      />
      <div className="flex-1 flex flex-col">
        <NavBar userRole={userRole} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
```

#### **Step 2: Implement User Layout**
```typescript
// packages/ui/src/layouts/UserLayout.tsx
import React from 'react';
import { UserRole } from '../navigation/types';
import { NavBar } from '../NavBar/NavBar';
import { Sidebar } from '../Sidebar/Sidebar';
import { MenuBuilder } from '../navigation/MenuBuilder';

interface UserLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ children, userRole }) => {
  const menuItems = MenuBuilder.buildForRole(userRole);

  return (
    <div className="user-layout flex h-screen">
      <Sidebar 
        sections={[{ id: 'main', items: menuItems }]}
        userRole={userRole}
        variant="compact"
        width="narrow"
      />
      <div className="flex-1 flex flex-col">
        <NavBar userRole={userRole} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
```

### **Day 6: Route Guard Implementation**

#### **Step 1: Create Route Guard**
```bash
touch packages/ui/src/navigation/RouteGuard.tsx
```

#### **Step 2: Implement Route Guard**
```typescript
// packages/ui/src/navigation/RouteGuard.tsx
import React from 'react';
import { useNavigation } from './NavigationContext';
import { Permission, UserRole } from './types';

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
  const { userRole, hasPermission } = useNavigation();

  // Check role requirement
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to fallback route
    window.location.href = fallbackRoute;
    return null;
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      hasPermission(permission)
    );

    if (!hasRequiredPermissions) {
      window.location.href = fallbackRoute;
      return null;
    }
  }

  return <>{children}</>;
};
```

---

## 🔧 **Phase 3: Integration (Days 7-10)**

### **Day 7: Update Existing Components**

#### **Step 1: Update NavBar Component**
```typescript
// Add to existing NavBar component
interface NavBarProps {
  // ... existing props
  userRole: UserRole;
}

const NavBarComponent: React.FC<NavBarProps> = ({
  // ... existing props
  userRole
}) => {
  const menuItems = MenuBuilder.buildForRole(userRole);
  
  // Use menuItems in navigation
  return (
    <nav>
      {menuItems.map(item => (
        <NavItem key={item.id} item={item} />
      ))}
    </nav>
  );
};
```

#### **Step 2: Update Sidebar Component**
```typescript
// Add to existing Sidebar component
interface SidebarProps {
  // ... existing props
  userRole: UserRole;
}

const SidebarComponent: React.FC<SidebarProps> = ({
  // ... existing props
  userRole
}) => {
  const menuItems = MenuBuilder.buildForRole(userRole);
  
  return (
    <aside>
      {menuItems.map(item => (
        <SidebarItem key={item.id} item={item} />
      ))}
    </aside>
  );
};
```

### **Day 8: Create Usage Examples**

#### **Step 1: Create Example Pages**
```bash
mkdir -p apps/web/pages/examples
touch apps/web/pages/examples/admin-demo.tsx
touch apps/web/pages/examples/user-demo.tsx
touch apps/web/pages/examples/superadmin-demo.tsx
```

#### **Step 2: Implement Example Pages**
```typescript
// apps/web/pages/examples/admin-demo.tsx
import React from 'react';
import { LayoutManager } from '@luxgen/ui';
import { UserRole } from '@luxgen/ui';

export default function AdminDemo() {
  return (
    <LayoutManager userRole={UserRole.ADMIN}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>This is the admin layout with admin-specific navigation.</p>
      </div>
    </LayoutManager>
  );
}
```

### **Day 9: Testing Setup**

#### **Step 1: Create Test Files**
```bash
mkdir -p packages/ui/src/navigation/__tests__
touch packages/ui/src/navigation/__tests__/permissions.test.ts
touch packages/ui/src/navigation/__tests__/MenuBuilder.test.ts
touch packages/ui/src/navigation/__tests__/NavigationContext.test.ts
```

#### **Step 2: Write Basic Tests**
```typescript
// packages/ui/src/navigation/__tests__/permissions.test.ts
import { UserRole, Permission, hasPermission } from '../permissions';

describe('Permission System', () => {
  test('should return correct permissions for SUPER_ADMIN', () => {
    expect(hasPermission(UserRole.SUPER_ADMIN, Permission.ADMIN)).toBe(true);
  });

  test('should return false for USER trying to access ADMIN permission', () => {
    expect(hasPermission(UserRole.USER, Permission.ADMIN)).toBe(false);
  });
});
```

### **Day 10: Documentation & Export**

#### **Step 1: Update Package Exports**
```typescript
// packages/ui/src/index.ts
// Add new exports
export * from './navigation/types';
export * from './navigation/permissions';
export * from './navigation/NavigationContext';
export * from './navigation/NavigationProvider';
export * from './navigation/MenuBuilder';
export * from './navigation/RouteGuard';
export * from './layouts/LayoutManager';
export * from './layouts/AdminLayout';
export * from './layouts/UserLayout';
export * from './layouts/SuperAdminLayout';
```

#### **Step 2: Create Usage Documentation**
```markdown
# Navigation Architecture Usage Guide

## Basic Usage

```typescript
import { 
  NavigationProvider, 
  LayoutManager, 
  UserRole 
} from '@luxgen/ui';

function App() {
  return (
    <NavigationProvider userRole={UserRole.ADMIN}>
      <LayoutManager userRole={UserRole.ADMIN}>
        <YourAppContent />
      </LayoutManager>
    </NavigationProvider>
  );
}
```

## Route Protection

```typescript
import { RouteGuard, Permission } from '@luxgen/ui';

function AdminPage() {
  return (
    <RouteGuard requiredPermissions={[Permission.ADMIN]}>
      <AdminContent />
    </RouteGuard>
  );
}
```
```

---

## 🎯 **Success Criteria**

### **Week 1 Goals:**
- [ ] Permission system implemented and tested
- [ ] Navigation context working
- [ ] Menu builder functional
- [ ] Basic layout system working
- [ ] Route guards implemented

### **Week 2 Goals:**
- [ ] Role-based layouts fully functional
- [ ] Integration with existing components
- [ ] Mobile navigation working
- [ ] Breadcrumb system implemented
- [ ] Theme integration complete

### **Week 3 Goals:**
- [ ] Advanced features implemented
- [ ] Performance optimizations
- [ ] Accessibility compliance
- [ ] Comprehensive testing
- [ ] Documentation complete

### **Week 4 Goals:**
- [ ] Production deployment ready
- [ ] Monitoring and analytics
- [ ] User feedback integration
- [ ] Performance monitoring
- [ ] Final optimizations

---

## 🚀 **Getting Started**

1. **Clone and Setup**
   ```bash
   git checkout -b feature/navigation-architecture
   npm install
   ```

2. **Start Implementation**
   ```bash
   # Begin with Day 1 tasks
   mkdir -p packages/ui/src/navigation
   # Follow the step-by-step implementation above
   ```

3. **Test Implementation**
   ```bash
   npm test
   npm run dev
   ```

4. **Verify Functionality**
   - Test different user roles
   - Verify permission-based navigation
   - Check responsive design
   - Validate accessibility

---

*This quick start guide provides a structured approach to implementing the navigation architecture. Follow the daily tasks to build a robust, scalable system.*

