import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { AppLayout, CustomerCreateForm, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { CREATE_USER } from '../../../graphql/queries/users';
import { getTenantPageProps } from '../../../lib/tenant-page-props';
import { useCommercePageShell } from '../../../lib/commerce-page-shell';
import { useAppTenantId } from '../../../lib/app-layout-user';
import { getStoredUser } from '../../../lib/session';
import { isMongoObjectId } from '../../../lib/mongo-id';

interface Props {
  tenant: string;
}

function CreateCustomerContent({ tenant }: Props) {
  const router = useRouter();
  const { appLayoutProps } = useCommercePageShell();
  const { showSuccess, showError } = useSnackbar();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const [createUser] = useMutation(CREATE_USER);

  const handleSave = async () => {
    if (!isMongoObjectId(queryTenantId)) {
      showError('Tenant not ready — refresh and try again.');
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      showError('First name, last name, and email are required.');
      return;
    }

    setSaving(true);
    try {
      const tempPassword = `Welcome${Date.now().toString(36)}!`;
      const { data } = await createUser({
        variables: {
          input: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            password: tempPassword,
            role: 'STUDENT',
            tenantId: queryTenantId,
          },
        },
      });

      const id = data?.createUser?.id as string | undefined;
      if (!id) {
        showError('Create failed — no customer id returned.');
        return;
      }

      showSuccess('Customer created');
      void router.push(`/admin/customers/${id}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create customer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Add customer — {tenant}</title>
      </Head>

      <AppLayout {...appLayoutProps}>
        <CustomerCreateForm
          firstName={firstName}
          lastName={lastName}
          email={email}
          saving={saving}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onEmailChange={setEmail}
          onSave={() => void handleSave()}
        />
      </AppLayout>
    </>
  );
}

export default function CreateCustomerPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <CreateCustomerContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
