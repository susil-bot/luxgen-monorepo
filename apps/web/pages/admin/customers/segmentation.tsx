import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppLayout, getDefaultLogo, getDefaultSidebarSections, SnackbarProvider } from '@luxgen/ui';
import { createHandleUserAction } from '../../../lib/user-actions';
import { useLayoutUser } from '../../../lib/app-layout-user';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../../lib/app-layout-header';

interface Props {
  tenant: string;
}

function CustomerSegmentationContent({ tenant }: Props) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const headerProps = useAppLayoutHeader();

  return (
    <>
      <Head>
        <title>Segmentation — Customers — {tenant}</title>
      </Head>
      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={layoutUser ?? undefined}
        logo={getDefaultLogo()}
        onUserAction={handleUserAction}
        {...headerProps}
        responsive
      >
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-semibold text-primary">Segmentation</h1>
          <p className="text-secondary mt-2">
            Create and manage customer segments for targeted campaigns and automations.
          </p>
        </div>
      </AppLayout>
    </>
  );
}

export default function CustomerSegmentationPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <CustomerSegmentationContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
