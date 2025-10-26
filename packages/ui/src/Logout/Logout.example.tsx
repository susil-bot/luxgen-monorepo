import React from 'react';
import { Logout, useLogout } from './index';

// Example user data
const exampleUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'ADMIN',
  avatar: 'https://example.com/avatar.jpg',
  initials: 'JD',
};

// Example component using the Logout component
export const LogoutExample: React.FC = () => {
  const { logout, isLoggingOut, error } = useLogout({
    onSuccess: () => {
      console.log('Logout successful');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
    redirectTo: '/login',
    clearStorage: true,
    storageKeys: ['token', 'user', 'tenant'],
  });

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2>Logout Component Examples</h2>
      
      {/* Default Logout */}
      <div>
        <h3>Default Logout</h3>
        <Logout
          onLogout={logout}
          user={exampleUser}
          showConfirmation={true}
        />
      </div>

      {/* Compact Logout */}
      <div>
        <h3>Compact Logout</h3>
        <Logout
          onLogout={logout}
          user={exampleUser}
          variant="compact"
          showConfirmation={false}
        />
      </div>

      {/* Minimal Logout */}
      <div>
        <h3>Minimal Logout</h3>
        <Logout
          onLogout={logout}
          user={exampleUser}
          variant="minimal"
          showConfirmation={false}
        />
      </div>

      {/* Danger Logout */}
      <div>
        <h3>Danger Logout</h3>
        <Logout
          onLogout={logout}
          user={exampleUser}
          variant="danger"
          showConfirmation={true}
        />
      </div>

      {/* Without User Info */}
      <div>
        <h3>Logout Without User Info</h3>
        <Logout
          onLogout={logout}
          showConfirmation={false}
        />
      </div>

      {/* Loading State */}
      <div>
        <h3>Loading State</h3>
        <Logout
          onLogout={logout}
          user={exampleUser}
          loading={isLoggingOut}
          showConfirmation={false}
        />
      </div>

      {/* Error State */}
      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#fee', borderRadius: '4px' }}>
          Error: {error.message}
        </div>
      )}
    </div>
  );
};

// Example of using Logout in a header
export const HeaderWithLogout: React.FC = () => {
  const { logout } = useLogout({
    redirectTo: '/login',
    clearStorage: true,
  });

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '16px',
      background: '#f8f9fa',
      borderBottom: '1px solid #e9ecef'
    }}>
      <h1>My Application</h1>
      <Logout
        onLogout={logout}
        user={exampleUser}
        variant="compact"
        showConfirmation={true}
      />
    </header>
  );
};

// Example of using Logout in a user menu
export const UserMenuWithLogout: React.FC = () => {
  const { logout } = useLogout({
    redirectTo: '/login',
    clearStorage: true,
  });

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '8px',
      padding: '16px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src={exampleUser.avatar} 
          alt={exampleUser.name}
          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
        />
        <div>
          <div style={{ fontWeight: 'bold' }}>{exampleUser.name}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>{exampleUser.role}</div>
        </div>
      </div>
      <Logout
        onLogout={logout}
        user={exampleUser}
        variant="minimal"
        showConfirmation={true}
      />
    </div>
  );
};

export default LogoutExample;
