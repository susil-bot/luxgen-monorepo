import { useEffect, useState } from 'react';
import { SettingsShell } from '../../components/settings/SettingsShell';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import {
  fetchNotificationTemplates,
  patchNotificationTemplate,
  type NotificationTemplateSummary,
} from '../../lib/tenant-api';

interface Props {
  tenant: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  order: 'Order confirmation',
  shipping: 'Enrollment / progress',
  refund: 'Refund processed',
  account: 'Account welcome',
  cart: 'Abandoned checkout',
};

export default function SettingsNotificationsPage({ tenant }: Props) {
  const [templates, setTemplates] = useState<NotificationTemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchNotificationTemplates();
        if (!cancelled) setTemplates(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SettingsShell tenant={tenant} activeSection="notifications" title="Notifications" subtitle="Email templates">
      <div className="ios-card overflow-hidden">
        {loading && <p className="p-4 text-secondary text-sm">Loading templates…</p>}
        {error && (
          <p className="p-4 text-sm" style={{ color: 'var(--color-red)' }}>
            {error}
          </p>
        )}
        {!loading && !error && (
          <ul className="divide-y" style={{ borderColor: 'var(--color-separator)' }}>
            {templates.map((t) => {
              const expanded = expandedId === t.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--color-fill-secondary)]"
                    onClick={() => setExpandedId(expanded ? null : t.id)}
                  >
                    <div>
                      <span className="text-primary font-medium">{t.label}</span>
                      <p className="text-xs text-tertiary mt-0.5">{CATEGORY_LABELS[t.category] ?? t.category}</p>
                    </div>
                    <span className={`badge ${t.status === 'live' ? 'badge-green' : 'badge-orange'} capitalize`}>
                      {t.status}
                    </span>
                  </button>
                  {expanded && (
                    <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: 'var(--color-separator)' }}>
                      <p className="text-xs text-tertiary pt-3">Subject</p>
                      <p className="text-sm text-primary">{t.subject}</p>
                      <p className="text-xs text-tertiary">Preview</p>
                      <pre className="text-xs text-secondary whitespace-pre-wrap bg-[var(--color-fill-quaternary)] rounded-lg p-3">
                        {t.bodyPreview}
                      </pre>
                      {editingId === t.id ? (
                        <div className="space-y-3 pt-2">
                          <input
                            className="ios-input w-full text-sm"
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                          />
                          <textarea
                            className="ios-input w-full text-sm min-h-[120px]"
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                          />
                          <button
                            type="button"
                            className="ios-btn-primary text-sm"
                            disabled={saving}
                            onClick={async () => {
                              setSaving(true);
                              try {
                                await patchNotificationTemplate(t.id, { subject: editSubject, body: editBody });
                                setTemplates(await fetchNotificationTemplates());
                                setEditingId(null);
                              } finally {
                                setSaving(false);
                              }
                            }}
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="ios-btn-secondary text-sm mt-2"
                          onClick={() => {
                            setEditingId(t.id);
                            setEditSubject(t.subject);
                            setEditBody(t.bodyPreview);
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SettingsShell>
  );
}

export const getServerSideProps = getTenantPageProps;
