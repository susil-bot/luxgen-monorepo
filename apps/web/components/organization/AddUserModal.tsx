import { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { useSnackbar } from '@luxgen/ui';
import { CREATE_USER, GET_USERS } from '../../graphql/queries/users';
import { parseUserUploadFile, type BulkUserRow } from '../../lib/parse-user-spreadsheet';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
}

type Tab = 'single' | 'bulk';

export function AddUserModal({ open, onClose, tenantId }: AddUserModalProps) {
  const { showSuccess, showError, showInfo } = useSnackbar();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>('single');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
    password: '',
  });

  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS, variables: { tenantId } }],
  });

  if (!open) return null;

  const reset = () => {
    setForm({ email: '', firstName: '', lastName: '', role: 'STUDENT', password: '' });
    setTab('single');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const inviteOne = async () => {
    if (!form.email || !form.firstName || !form.password) {
      showError('Email, first name, and password are required.');
      return;
    }
    setLoading(true);
    try {
      await createUser({
        variables: {
          input: {
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName || ' ',
            role: form.role,
            password: form.password,
            tenantId,
          },
        },
      });
      showSuccess(`Invited ${form.email}`);
      handleClose();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const inviteBulk = async (rows: BulkUserRow[]) => {
    setLoading(true);
    let ok = 0;
    let fail = 0;
    for (const row of rows) {
      try {
        await createUser({
          variables: {
            input: {
              email: row.email,
              firstName: row.firstName,
              lastName: row.lastName || ' ',
              role: row.role,
              password: `Temp-${Math.random().toString(36).slice(2, 10)}!1A`,
              tenantId,
            },
          },
        });
        ok++;
      } catch {
        fail++;
      }
    }
    setLoading(false);
    if (ok) showSuccess(`Added ${ok} user${ok === 1 ? '' : 's'}${fail ? ` (${fail} failed)` : ''}`);
    if (!ok) showError('No users were added. Check the file format.');
    else handleClose();
  };

  const handleFile = async (file: File) => {
    try {
      const rows = await parseUserUploadFile(file);
      if (!rows.length) {
        showError('No valid rows found. Use columns: email, first name, last name, role.');
        return;
      }
      showInfo(`Importing ${rows.length} users…`);
      await inviteBulk(rows);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Could not parse file');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-user-title"
    >
      <div className="ios-card w-full max-w-lg p-6 space-y-5" style={{ maxHeight: '90vh', overflow: 'auto' }}>
        <div className="flex items-center justify-between">
          <h2 id="add-user-title" className="text-lg font-semibold text-primary">
            Add users
          </h2>
          <button type="button" className="ios-btn-plain" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--color-fill-tertiary)' }}>
          {(['single', 'bulk'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t ? 'ios-card shadow-sm' : 'text-secondary'
              }`}
              onClick={() => setTab(t)}
            >
              {t === 'single' ? 'Single user' : 'Bulk upload'}
            </button>
          ))}
        </div>

        {tab === 'single' ? (
          <div className="space-y-4">
            <div className="ios-form-group">
              <label htmlFor="add-email">Email</label>
              <input
                id="add-email"
                type="email"
                className="ios-input w-full"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="ios-form-group">
                <label htmlFor="add-first">First name</label>
                <input
                  id="add-first"
                  className="ios-input w-full"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="ios-form-group">
                <label htmlFor="add-last">Last name</label>
                <input
                  id="add-last"
                  className="ios-input w-full"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="ios-form-group">
              <label htmlFor="add-role">Role</label>
              <select
                id="add-role"
                className="ios-input w-full"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="ADMIN">Administrator</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="STUDENT">Member</option>
              </select>
            </div>
            <div className="ios-form-group">
              <label htmlFor="add-pass">Temporary password</label>
              <input
                id="add-pass"
                type="password"
                className="ios-input w-full"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <button
              type="button"
              className="ios-btn-primary w-full"
              disabled={loading}
              onClick={() => void inviteOne()}
            >
              {loading ? 'Adding…' : 'Add user'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-secondary">
              Upload a CSV with columns: <strong>email</strong>, <strong>first name</strong>, <strong>last name</strong>
              , <strong>role</strong>. Export from Excel as CSV if needed.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              className="ios-btn-secondary w-full"
              disabled={loading}
              onClick={() => fileRef.current?.click()}
            >
              {loading ? 'Importing…' : 'Choose CSV file'}
            </button>
            <a
              href="data:text/csv,email,first%20name,last%20name,role%0Auser@example.com,Jane,Doe,INSTRUCTOR"
              download="users-template.csv"
              className="ios-btn-plain text-sm block text-center"
            >
              Download template
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
