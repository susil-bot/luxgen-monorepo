import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { AppLayout, getDefaultLogo, getDefaultSidebarSections, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { createHandleUserAction } from '../lib/user-actions';
import { useLayoutUser } from '../lib/app-layout-user';
import { useAppLayoutHeader } from '../lib/app-layout-header';
import { getStoredUser, updateStoredUser } from '../lib/session';
import { UPDATE_USER } from '../graphql/queries/auth';
import { getTenantPageProps } from '../lib/tenant-page-props';

interface ProfilePageProps {
  tenant: string;
}

function ProfileContent({ tenant }: ProfilePageProps) {
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);
  const headerProps = useAppLayoutHeader();
  const { showSuccess, showError } = useSnackbar();
  const session = typeof window !== 'undefined' ? getStoredUser() : null;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = getStoredUser();
    if (s) {
      setFirstName(s.firstName);
      setLastName(s.lastName);
      setEmail(s.email);
    }
  }, []);

  const [updateUser] = useMutation(UPDATE_USER);

  const handleSave = async () => {
    if (!session?.id) {
      showError('No active session');
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        variables: {
          id: session.id,
          input: { firstName: firstName.trim(), lastName: lastName.trim() },
        },
      });
      updateStoredUser({ firstName: firstName.trim(), lastName: lastName.trim() });
      showSuccess('Your profile changes were saved successfully.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not save profile';
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const displayName = layoutUser?.name ?? `${firstName} ${lastName}`.trim();

  return (
    <>
      <Head>
        <title>Profile — {tenant}</title>
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={layoutUser ?? undefined}
        logo={getDefaultLogo()}
        onUserAction={handleUserAction}
        {...headerProps}
        responsive
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <h1 className="ios-large-title">Profile</h1>
            <p className="mt-1 text-secondary text-sm">Your account and workspace membership</p>
          </div>

          <div className="ios-card p-6 flex items-center gap-4">
            <div className="ios-avatar ios-avatar-xl">{displayName.charAt(0).toUpperCase()}</div>
            <div>
              <p className="text-lg font-semibold text-primary">{displayName || 'User'}</p>
              <p className="text-sm text-secondary">{email}</p>
              <p className="text-xs text-tertiary mt-1 capitalize">{session?.role?.toLowerCase() ?? 'member'}</p>
            </div>
          </div>

          <div className="ios-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-primary">Basic information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="ios-form-group">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  className="ios-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="ios-form-group">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  className="ios-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="ios-form-group">
              <label htmlFor="email">Email</label>
              <input id="email" className="ios-input" value={email} disabled />
              <p className="text-xs text-tertiary mt-1">Contact admin to change email</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" className="ios-btn-primary" disabled={saving} onClick={() => void handleSave()}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <Link href="/settings" className="ios-btn-secondary inline-flex items-center">
                Store settings
              </Link>
            </div>
          </div>

          <div className="ios-card p-6">
            <h2 className="text-lg font-semibold text-primary mb-2">Workspace</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-tertiary">Tenant</dt>
                <dd className="text-primary font-medium">{session?.tenant.name ?? tenant}</dd>
              </div>
              <div>
                <dt className="text-tertiary">Subdomain</dt>
                <dd className="text-primary font-medium">{session?.tenant.subdomain ?? tenant}.localhost</dd>
              </div>
            </dl>
          </div>
        </div>
      </AppLayout>
    </>
  );
}

export default function ProfilePage(props: ProfilePageProps) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <ProfileContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
