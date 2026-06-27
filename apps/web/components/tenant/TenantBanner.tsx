interface TenantBannerProps {
  tenant: string;
}

export function TenantBanner({ tenant }: TenantBannerProps) {
  return (
    <div className="lux-brand-gradient lux-brand-gradient-text p-6 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome to {tenant.charAt(0).toUpperCase() + tenant.slice(1)}</h2>
          <p className="lux-brand-gradient-muted mt-1">Your learning management dashboard</p>
        </div>
        <div className="text-right">
          <div className="text-sm lux-brand-gradient-muted">Current Tenant</div>
          <div className="text-lg font-semibold">{tenant}</div>
        </div>
      </div>
    </div>
  );
}
