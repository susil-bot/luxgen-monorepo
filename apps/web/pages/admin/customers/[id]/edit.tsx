import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { AppLayout, CustomerEditForm, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { PageLoadingState } from '../../../../components/common/PageStates';
import { GET_USER, UPDATE_USER, UPDATE_CUSTOMER_NOTES } from '../../../../graphql/queries/users';
import { getTenantPageProps } from '../../../../lib/tenant-page-props';
import { useCommercePageShell } from '../../../../lib/commerce-page-shell';
import { isLearnerRole } from '../../../../lib/user-roles';

interface Props {
  tenant: string;
}

function EditCustomerContent({ tenant }: Props) {
  const router = useRouter();
  const { appLayoutProps } = useCommercePageShell();
  const { showSuccess, showError } = useSnackbar();
  const customerId = typeof router.query.id === 'string' ? router.query.id : '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingEmail, setMarketingEmail] = useState(true);
  const [marketingSms, setMarketingSms] = useState(false);
  const [marketingWhatsapp, setMarketingWhatsapp] = useState(false);
  const [staffNotes, setStaffNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const { data, loading } = useQuery(GET_USER, {
    variables: { id: customerId },
    skip: !customerId,
    fetchPolicy: 'cache-and-network',
  });

  const [updateUser] = useMutation(UPDATE_USER);
  const [updateCustomerNotes] = useMutation(UPDATE_CUSTOMER_NOTES);

  const user = data?.user;

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setEmail(user.email ?? '');
    setPhone(user.phone ?? '');
    setMarketingEmail(user.marketingEmail ?? true);
    setMarketingSms(user.marketingSms ?? false);
    setMarketingWhatsapp(user.marketingWhatsapp ?? false);
    setStaffNotes(user.staffNotes ?? '');
  }, [user]);

  const handleSave = async () => {
    if (!customerId || !firstName.trim() || !lastName.trim() || !email.trim()) {
      showError('First name, last name, and email are required.');
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        variables: {
          id: customerId,
          input: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            marketingEmail,
            marketingSms,
            marketingWhatsapp,
          },
        },
      });

      await updateCustomerNotes({
        variables: {
          input: { customerId, notes: staffNotes },
        },
      });

      showSuccess('Customer saved');
      void router.push(`/admin/customers/${customerId}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!customerId) {
    return <PageLoadingState label="Loading customer…" />;
  }

  if (loading && !user) {
    return <PageLoadingState label="Loading customer…" />;
  }

  if (!user || !isLearnerRole(user.role)) {
    return (
      <AppLayout {...appLayoutProps}>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-secondary">Customer not found</p>
          <Link href="/admin/customers" className="ios-btn-primary mt-4 inline-block">
            Back to customers
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <Head>
        <title>
          {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Edit customer'} — {tenant}
        </title>
      </Head>

      <AppLayout {...appLayoutProps}>
        <CustomerEditForm
          firstName={firstName}
          lastName={lastName}
          email={email}
          phone={phone}
          marketingEmail={marketingEmail}
          marketingSms={marketingSms}
          marketingWhatsapp={marketingWhatsapp}
          staffNotes={staffNotes}
          saving={saving}
          backHref={`/admin/customers/${customerId}`}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onEmailChange={setEmail}
          onPhoneChange={setPhone}
          onMarketingEmailChange={setMarketingEmail}
          onMarketingSmsChange={setMarketingSms}
          onMarketingWhatsappChange={setMarketingWhatsapp}
          onStaffNotesChange={setStaffNotes}
          onSave={() => void handleSave()}
        />
      </AppLayout>
    </>
  );
}

export default function EditCustomerPage(props: Props) {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <EditCustomerContent {...props} />
    </SnackbarProvider>
  );
}

export const getServerSideProps = getTenantPageProps;
