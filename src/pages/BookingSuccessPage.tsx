import { useSearchParams, Link } from 'react-router-dom';

export default function BookingSuccessPage() {
  const [params] = useSearchParams();
  const session = params.get('session');

  return (
    <div
      style={{
        background: '#F8F9FB',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
      }}
    >
      <div
        style={{
          background: 'white',
          border: '1px solid #E7E9EE',
          borderRadius: 20,
          padding: '48px 40px',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Success icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#DCFCE7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5 9-11" />
          </svg>
        </div>

        <h1
          style={{
            margin: '0 0 8px',
            fontSize: 26,
            fontWeight: 700,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            fontFamily: 'var(--display)',
          }}
        >
          Оплату здійснено успішно!
        </h1>
        <p style={{ margin: '0 0 8px', fontSize: 15, color: '#3F4651', lineHeight: 1.6 }}>
          Ваше заняття підтверджено.
        </p>
        <p style={{ margin: '0 0 32px', fontSize: 13.5, color: '#6B7280' }}>
          Квитанцію надіслано на вашу електронну пошту.
        </p>

        {session && (
          <p style={{ margin: '0 0 24px', fontSize: 12, color: '#9CA3AF' }}>
            ID сесії: {session}
          </p>
        )}

        <Link
          to="/search"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 28px',
            background: 'var(--accent-600)',
            color: 'white',
            borderRadius: 10,
            textDecoration: 'none',
            fontSize: 14.5,
            fontWeight: 600,
            fontFamily: 'inherit',
            boxShadow: '0 4px 12px var(--accent-shadow)',
          }}
        >
          Знайти ще тренерів
        </Link>
      </div>
    </div>
  );
}
