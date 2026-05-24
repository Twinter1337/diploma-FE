import type { CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LeftPanel from '../components/auth/LeftPanel';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import { useIsMobile } from '../hooks/useWindowWidth';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const isMobile = useIsMobile();

  return (
    <div style={{
      minHeight: '100vh', display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    }}>
      {!isMobile && <LeftPanel />}

      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: isMobile ? '32px 20px' : '48px 56px',
        background: 'white', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 440, margin: '0 auto' }}>
          {!token ? (
            <>
              <div style={{ marginBottom: 22 }}>
                <h2 style={{
                  margin: 0, fontSize: 24, fontWeight: 700, color: '#0F172A',
                  letterSpacing: '-0.025em', fontFamily: 'var(--auth-display)',
                }}>
                  Недійсне посилання
                </h2>
                <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
                  Це посилання для скидання пароля недійсне. Запросіть нове, щоб продовжити.
                </p>
              </div>
              <Link to="/forgot-password" style={styles.primaryBtnLink}>
                Запросити нове посилання
              </Link>
              <p style={{ marginTop: 22, fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
                <Link to="/auth" style={styles.linkBtn}>Повернутись до входу</Link>
              </p>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 22 }}>
                <h2 style={{
                  margin: 0, fontSize: 24, fontWeight: 700, color: '#0F172A',
                  letterSpacing: '-0.025em', fontFamily: 'var(--auth-display)',
                }}>
                  Новий пароль
                </h2>
                <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
                  Створіть новий пароль для вашого облікового запису.
                </p>
              </div>
              <ResetPasswordForm token={token} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  primaryBtnLink: {
    display: 'block', width: '100%', padding: '13px 16px',
    background: 'var(--auth-accent-600)', color: 'white',
    border: 'none', borderRadius: 10, textAlign: 'center',
    fontSize: 14.5, fontWeight: 600, textDecoration: 'none', fontFamily: 'inherit',
    boxShadow: '0 2px 8px var(--auth-accent-shadow)',
  },
  linkBtn: {
    color: 'var(--auth-accent-700)', fontWeight: 600,
    textDecoration: 'none',
  },
};
