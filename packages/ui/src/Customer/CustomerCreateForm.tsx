import { EntityFormPageLayout } from '../SplitPageLayout/EntityFormPageLayout';
import { SplitPageHeader } from '../SplitPageLayout/SplitPageHeader';
import { SplitPageSection } from '../SplitPageLayout/SplitPageSection';
import { SplitPageFormField } from '../SplitPageLayout/SplitPageFormField';
import { CustomerTranslations } from './translations';

export interface CustomerCreateFormProps {
  firstName: string;
  lastName: string;
  email: string;
  saving?: boolean;
  backHref?: string;
  saveLabel?: string;
  savingLabel?: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSave: () => void;
}

export function CustomerCreateForm({
  firstName,
  lastName,
  email,
  saving,
  backHref = '/admin/customers',
  saveLabel = 'Save customer',
  savingLabel = 'Saving…',
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onSave,
}: CustomerCreateFormProps) {
  const t = CustomerTranslations.en;
  const displayTitle = [firstName, lastName].filter(Boolean).join(' ') || 'New customer';

  return (
    <EntityFormPageLayout
      header={
        <SplitPageHeader
          backHref={backHref}
          backLabel={t.backToCustomers}
          title={displayTitle}
          badges={<span className="badge badge-blue">New</span>}
          actions={
            <button type="button" className="ios-btn-primary text-sm" disabled={saving} onClick={onSave}>
              {saving ? savingLabel : saveLabel}
            </button>
          }
        />
      }
      main={
        <SplitPageSection title="Customer overview">
          <p className="text-sm text-secondary">
            Add a learner account. They can sign in after you share credentials or send an invite.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SplitPageFormField id="customer-first-name" label="First name">
              <input
                id="customer-first-name"
                type="text"
                className="ios-input w-full"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                autoComplete="given-name"
                required
              />
            </SplitPageFormField>
            <SplitPageFormField id="customer-last-name" label="Last name">
              <input
                id="customer-last-name"
                type="text"
                className="ios-input w-full"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                autoComplete="family-name"
                required
              />
            </SplitPageFormField>
          </div>
          <SplitPageFormField id="customer-email" label="Email" hint="Used for login and order notifications.">
            <input
              id="customer-email"
              type="email"
              className="ios-input w-full"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              autoComplete="email"
              required
            />
          </SplitPageFormField>
        </SplitPageSection>
      }
      aside={
        <>
          <SplitPageSection title="Marketing">
            <p className="text-sm text-secondary">
              Email marketing preferences can be updated after the customer is created.
            </p>
          </SplitPageSection>
          <SplitPageSection title="Notes">
            <p className="text-sm text-secondary">Staff notes are available on the customer profile after save.</p>
          </SplitPageSection>
        </>
      }
    />
  );
}
