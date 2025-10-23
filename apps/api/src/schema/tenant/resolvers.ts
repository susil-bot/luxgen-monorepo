import { tenantService } from '../../services/tenantService';

export const tenantResolvers = {
  Query: {
    tenant: async (_: any, { id }: { id: string }) => {
      return await tenantService.getTenantById(id);
    },
    tenantBySubdomain: async (_: any, { subdomain }: { subdomain: string }) => {
      return await tenantService.getTenantBySubdomain(subdomain);
    },
    tenants: async () => {
      return await tenantService.getAllTenants();
    },
  },
  Mutation: {
    createTenant: async (_: any, { input }: { input: any }) => {
      return await tenantService.createTenant(input);
    },
    updateTenant: async (_: any, { id, input }: { id: string; input: any }) => {
      return await tenantService.updateTenant(id, input);
    },
    deleteTenant: async (_: any, { id }: { id: string }) => {
      return await tenantService.deleteTenant(id);
    },
  },
};
