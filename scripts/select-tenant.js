#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const tenantConfigs = {
  'demo': {
    id: 'demo',
    name: 'Demo Tenant',
    subdomain: 'demo',
    logo: {
      src: '/logos/demo-logo.svg',
      text: 'LuxGen',
      alt: 'LuxGen Demo Logo',
      href: '/',
    },
    primaryColor: '#3B82F6',
  },
  'idea-vibes': {
    id: 'idea-vibes',
    name: 'Idea Vibes',
    subdomain: 'idea-vibes',
    logo: {
      src: '/logos/idea-vibes-logo.svg',
      text: 'Idea Vibes',
      alt: 'Idea Vibes Logo',
      href: '/',
    },
    primaryColor: '#8B5CF6',
  },
  'acme-corp': {
    id: 'acme-corp',
    name: 'ACME Corporation',
    subdomain: 'acme-corp',
    logo: {
      src: '/logos/acme-logo.svg',
      text: 'ACME',
      alt: 'ACME Corporation Logo',
      href: '/',
    },
    primaryColor: '#DC2626',
  },
};

function displayTenants() {
  console.log('\n🏢 Available Tenants:');
  console.log('===================');
  
  Object.entries(tenantConfigs).forEach(([key, config], index) => {
    console.log(`${index + 1}. ${config.name} (${key})`);
    console.log(`   Subdomain: ${config.subdomain}`);
    console.log(`   Logo: ${config.logo.text}`);
    console.log(`   Primary Color: ${config.primaryColor}`);
    console.log('');
  });
}

function selectTenant() {
  return new Promise((resolve) => {
    displayTenants();
    
    rl.question('Select tenant (1-3) or enter tenant ID: ', (answer) => {
      const trimmedAnswer = answer.trim();
      
      // Check if it's a number (1-3)
      const num = parseInt(trimmedAnswer);
      if (num >= 1 && num <= 3) {
        const tenantKeys = Object.keys(tenantConfigs);
        const selectedKey = tenantKeys[num - 1];
        resolve(selectedKey);
        return;
      }
      
      // Check if it's a valid tenant ID
      if (tenantConfigs[trimmedAnswer]) {
        resolve(trimmedAnswer);
        return;
      }
      
      console.log('❌ Invalid selection. Please try again.');
      selectTenant().then(resolve);
    });
  });
}

function generateTenantConfig(tenantId) {
  const config = tenantConfigs[tenantId];
  
  const configContent = `// Auto-generated tenant configuration
// Generated at: ${new Date().toISOString()}
// Selected tenant: ${tenantId}

export const SELECTED_TENANT = '${tenantId}';

export const TENANT_CONFIG = {
  id: '${config.id}',
  name: '${config.name}',
  subdomain: '${config.subdomain}',
  logo: ${JSON.stringify(config.logo, null, 2)},
  primaryColor: '${config.primaryColor}',
};

export const getTenantLogo = () => TENANT_CONFIG.logo;
export const getTenantTheme = () => ({
  colors: {
    primary: '${config.primaryColor}',
    secondary: '#6B7280',
    accent: '#F59E0B',
    background: '#FFFFFF',
    backgroundSecondary: '#F3F4F6',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '${config.primaryColor}',
  },
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
    secondary: 'Georgia, serif',
    mono: 'Fira Code, monospace',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
});
`;

  // Write to packages/ui/src/selected-tenant.ts
  const outputPath = path.join(__dirname, '..', 'packages', 'ui', 'src', 'selected-tenant.ts');
  fs.writeFileSync(outputPath, configContent);
  
  console.log(`✅ Tenant configuration generated for: ${config.name}`);
  console.log(`📁 Configuration saved to: ${outputPath}`);
}

async function main() {
  console.log('🚀 LuxGen Tenant Selection');
  console.log('==========================');
  
  // Check if tenant ID is provided as command line argument
  const args = process.argv.slice(2);
  let selectedTenant;
  
  if (args.length > 0) {
    selectedTenant = args[0];
    if (!tenantConfigs[selectedTenant]) {
      console.error(`❌ Invalid tenant ID: ${selectedTenant}`);
      console.log('Available tenants:', Object.keys(tenantConfigs).join(', '));
      process.exit(1);
    }
  } else {
    console.log('Select a tenant to build the application for:');
    selectedTenant = await selectTenant();
  }
  
  try {
    const config = tenantConfigs[selectedTenant];
    
    console.log(`\n✅ Selected: ${config.name}`);
    console.log(`🎨 Primary Color: ${config.primaryColor}`);
    console.log(`🏷️  Subdomain: ${config.subdomain}`);
    console.log(`🎨 Logo: ${config.logo.text}${config.logo.src ? ` (${config.logo.src})` : ''}`);
    
    generateTenantConfig(selectedTenant);
    
    console.log('\n🎉 Tenant configuration complete!');
    console.log('You can now run your build commands.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
