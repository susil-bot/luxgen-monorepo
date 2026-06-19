import { EntityFormPageLayout } from '../SplitPageLayout/EntityFormPageLayout';
import { SplitPageHeader } from '../SplitPageLayout/SplitPageHeader';
import { SplitPageSection } from '../SplitPageLayout/SplitPageSection';
import { SplitPageFormField } from '../SplitPageLayout/SplitPageFormField';
import { CustomerTranslations } from './translations';

export interface CustomerEditFormProps {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  marketingEmail?: boolean;
  marketingSms?: boolean;
  marketingWhatsapp?: boolean;
  staffNotes?: string;
  saving?: boolean;
  backHref?: string;
  saveLabel?: string;
  savingLabel?: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange?: (value: string) => void;
  onMarketingEmailChange?: (value: boolean) => void;
  onMarketingSmsChange?: (value: boolean) => void;
  onMarketingWhatsappChange?: (value: boolean) => void;
  onStaffNotesChange?: (value: string) => void;
  onSave: () => void;
}

function customerInitials(firstName: string, lastName: string): string {
  const a = firstName.trim()[0] ?? '';
  const b = lastName.trim()[0] ?? '';
  const initials = `${a}${b}`.toUpperCase();
  return initials || '?';
}

export function CustomerEditForm({
  firstName,
  lastName,
  email,
  phone = '',
  marketingEmail = true,
  marketingSms = false,
  marketingWhatsapp = false,
  staffNotes = '',
  saving,
  backHref = '/admin/customers',
  saveLabel = 'Save',
  savingLabel = 'Saving…',
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onMarketingEmailChange,
  onMarketingSmsChange,
  onMarketingWhatsappChange,
  onStaffNotesChange,
  onSave,
}: CustomerEditFormProps) {
  const t = CustomerTranslations.en;
  const displayTitle = [firstName, lastName].filter(Boolean).join(' ') || 'Customer';
  const initials = customerInitials(firstName, lastName);

  return (
    <EntityFormPageLayout
      header={
        <SplitPageHeader
          backHref={backHref}
          backLabel={t.backToCustomers}
          title={displayTitle}
          leading={
            <div
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white"
              style={{ background: 'var(--color-purple)' }}
              aria-hidden
            >
              {initials}
            </div>
          }
          actions={
            <button type="button" className="ios-btn-primary text-sm" disabled={saving} onClick={onSave}>
              {saving ? savingLabel : saveLabel}
            </button>
          }
        />
      }
      main={
        <SplitPageSection title="Customer details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SplitPageFormField id="edit-customer-first-name" label="First name">
              <input
                id="edit-customer-first-name"
                type="text"
                className="ios-input w-full"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                autoComplete="given-name"
                required
              />
            </SplitPageFormField>
            <SplitPageFormField id="edit-customer-last-name" label="Last name">
              <input
                id="edit-customer-last-name"
                type="text"
                className="ios-input w-full"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                autoComplete="family-name"
                required
              />
            </SplitPageFormField>
          </div>
          <SplitPageFormField id="edit-customer-email" label="Email">
            <input
              id="edit-customer-email"
              type="email"
              className="ios-input w-full"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              autoComplete="email"
              required
            />
          </SplitPageFormField>
          {onPhoneChange && (
            <SplitPageFormField id="edit-customer-phone" label="Phone">
              <input
                id="edit-customer-phone"
                type="tel"
                className="ios-input w-full"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                autoComplete="tel"
                placeholder="+1 555 000 0000"
              />
            </SplitPageFormField>
          )}
        </SplitPageSection>
      }
      aside={
        <>
          <SplitPageSection title="Staff notes">
            {onStaffNotesChange ? (
              <textarea
                className="ios-input w-full min-h-[120px] resize-y"
                value={staffNotes}
                onChange={(e) => onStaffNotesChange(e.target.value)}
                placeholder="Internal notes visible to staff only…"
              />
            ) : (
              <p className="text-sm text-secondary whitespace-pre-wrap">{staffNotes || 'No notes yet.'}</p>
            )}
          </SplitPageSection>
          <SplitPageSection title="Marketing">
            <ul className="space-y-3 text-sm">
              {onMarketingEmailChange && (
                <li className="flex items-center gap-2">
                  <input
                    id="edit-marketing-email"
                    type="checkbox"
                    checked={marketingEmail}
                    onChange={(e) => onMarketingEmailChange(e.target.checked)}
                  />
                  <label htmlFor="edit-marketing-email" className="text-secondary">
                    Email
                  </label>
                </li>
              )}
              {onMarketingSmsChange && (
                <li className="flex items-center gap-2">
                  <input
                    id="edit-marketing-sms"
                    type="checkbox"
                    checked={marketingSms}
                    onChange={(e) => onMarketingSmsChange(e.target.checked)}
                  />
                  <label htmlFor="edit-marketing-sms" className="text-secondary">
                    SMS
                  </label>
                </li>
              )}
              {onMarketingWhatsappChange && (
                <li className="flex items-center gap-2">
                  <input
                    id="edit-marketing-whatsapp"
                    type="checkbox"
                    checked={marketingWhatsapp}
                    onChange={(e) => onMarketingWhatsappChange(e.target.checked)}
                  />
                  <label htmlFor="edit-marketing-whatsapp" className="text-secondary">
                    WhatsApp
                  </label>
                </li>
              )}
            </ul>
          </SplitPageSection>
        </>
      }
    />
  );
}
