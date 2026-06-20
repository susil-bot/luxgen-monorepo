import { GetServerSideProps } from 'next';
import { resolvePageTenant } from '../../lib/tenant-page-props';

/** @deprecated Use /organization/billing */
export default function BillingRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const tenant = resolvePageTenant(context);
  const search = context.resolvedUrl.includes('?') ? context.resolvedUrl.slice(context.resolvedUrl.indexOf('?')) : '';
  const dest = search.includes('tenant=') ? `/organization/billing${search}` : `/organization/billing?tenant=${tenant}`;
  return { redirect: { destination: dest, permanent: false } };
};
