'use client';

import { useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import StatusBadge from '@/components/ui/StatusBadge';
import { User, Mail, Shield, Building, Save } from 'lucide-react';
import { toast } from '@/lib/toast';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin.user@enterprise.internal',
    role: 'System Administrator',
    department: 'Engineering & Operations',
    bio: 'Lead architect responsible for large dataset optimization and core platform stability.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Profile Updated',
      description: 'Your user profile details have been saved.',
      type: 'success',
    });
  };

  return (
    <PageShell
      title="User Profile"
      description="Manage account details, security credentials, and department settings."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'User Profile' }]}
    >
      <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header Badge Card */}
        <div
          style={{
            padding: 24,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--text)',
              color: 'var(--bg)',
              fontSize: 22,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            AD
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>{formData.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{formData.email}</p>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <StatusBadge value="Active Account" variant="status" />
              <StatusBadge value={formData.role} variant="tag" />
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form
          onSubmit={handleSubmit}
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
          <h3 style={{ fontSize: 15, fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            Account Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  color: 'var(--text)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  color: 'var(--text)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Role
              </label>
              <input
                type="text"
                disabled
                value={formData.role}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  color: 'var(--text)',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Bio / Description
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: 13,
                color: 'var(--text)',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="submit"
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
              <Save size={14} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
