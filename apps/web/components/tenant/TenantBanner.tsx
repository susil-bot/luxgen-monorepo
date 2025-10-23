interface TenantBannerProps {
  tenant: string;
}

export function TenantBanner({ tenant }: TenantBannerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Welcome to {tenant.charAt(0).toUpperCase() + tenant.slice(1)}
          </h2>
          <p className="text-blue-100 mt-1">
            Your learning management dashboard
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-blue-100">Current Tenant</div>
          <div className="text-lg font-semibold">{tenant}</div>
        </div>
      </div>
    </div>
  );
}
