'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--danger)',
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        !
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400 }}>
        {error?.message || 'An unhandled exception occurred in this application segment.'}
      </p>
      <button
        onClick={() => reset()}
        style={{
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
        Try Again
      </button>
    </div>
  );
}
