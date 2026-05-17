import { Link, useNavigate } from 'react-router-dom';

export default function BookingCancelPage() {
  const navigate = useNavigate();

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
        {/* Cancel icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
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
          Оплату не завершено
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: 15, color: '#6B7280', lineHeight: 1.6 }}>
          Ви відмінили оформлення оплати. Бронювання не підтверджено.
          <br />
          Ви можете спробувати знову, якщо місце ще вільне.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 28px',
              background: 'var(--accent-600)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 14.5,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 12px var(--accent-shadow)',
              transition: 'background 120ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-700)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent-600)')}
          >
            Спробувати ще раз
          </button>

          <Link
            to="/search"
            style={{
              padding: '12px 28px',
              background: 'white',
              color: '#3F4651',
              border: '1.5px solid #E7E9EE',
              borderRadius: 10,
              fontSize: 14.5,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Повернутись до пошуку
          </Link>
        </div>
      </div>
    </div>
  );
}
