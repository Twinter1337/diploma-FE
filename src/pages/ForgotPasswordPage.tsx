import LeftPanel from '../components/auth/LeftPanel';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import { useIsMobile } from '../hooks/useWindowWidth';

export default function ForgotPasswordPage() {
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
          <div style={{ marginBottom: 22 }}>
            <h2 style={{
              margin: 0, fontSize: 24, fontWeight: 700, color: '#0F172A',
              letterSpacing: '-0.025em', fontFamily: 'var(--auth-display)',
            }}>
              Відновлення пароля
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
              Введіть пошту, з якою ви зареєстровані. Ми надішлемо вам посилання для скидання пароля.
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
