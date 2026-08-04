import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text)' }}>
        404
      </h1>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400 }}>
        The requested resource or page route could not be located on the system console.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 8,
          padding: '8px 16px',
          background: 'var(--accent)',
          color: 'var(--accent-fg)',
          border: 'none',
          borderRadius: 'var(--radius)',
          fontSize: 13,
          fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        Return to Overview
      </Link>
    </div>
  );
}
