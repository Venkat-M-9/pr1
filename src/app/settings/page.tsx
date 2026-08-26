'use client';

import PageShell from '@/components/layout/PageShell';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { toast } from '@/lib/toast';
import { Sliders, Bell, Shield, Database, Save } from 'lucide-react';

export default function SettingsPage() {
  const [pageSize, setPageSize] = useLocalStorage('pref_page_size', 20);
  const [virtualizationEnabled, setVirtualizationEnabled] = useLocalStorage('pref_virtualization', true);
  const [compactDensity, setCompactDensity] = useLocalStorage('pref_compact', false);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('pref_notifications', true);

  const handleSave = () => {
    toast.crud('settings', 'Preferences Saved', 'Your workspace preferences and table configuration have been persisted.');
  };

  return (
    <PageShell
      title="Settings & Preferences"
      description="Configure dataset performance parameters, UI density, and workspace defaults."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Settings' }]}
    >
      <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Table & Data Performance Settings */}
        <div
          style={{
            padding: 24,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            <Database size={18} />
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Data & Virtualization Preferences</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', display: 'block' }}>
                Enable Virtual Scrolling
              </label>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Render only visible table rows for 1,000+ record lists.
              </span>
            </div>
            <input
              type="checkbox"
              checked={virtualizationEnabled}
              onChange={e => setVirtualizationEnabled(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', display: 'block' }}>
                Default Page Size (Non-virtualized)
              </label>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Rows per page for reports and statement tables.
              </span>
            </div>
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              style={{
                padding: '4px 10px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                color: 'var(--text)',
              }}
            >
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
              <option value={50}>50 rows</option>
            </select>
          </div>
        </div>

        {/* UI & Display Settings */}
        <div
          style={{
            padding: 24,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            <Sliders size={18} />
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Interface & Layout</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', display: 'block' }}>
                Compact Density Mode
              </label>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Reduce padding across tables and grid lists.
              </span>
            </div>
            <input
              type="checkbox"
              checked={compactDensity}
              onChange={e => setCompactDensity(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', display: 'block' }}>
                System Notifications
              </label>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Show toast popups for user actions and exports.
              </span>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={e => setNotificationsEnabled(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Save size={14} /> Save Preferences
          </button>
        </div>
      </div>
    </PageShell>
  );
}
