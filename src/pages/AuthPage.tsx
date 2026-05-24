import { useState } from 'react';
import type { CSSProperties } from 'react';
import LeftPanel from '../components/auth/LeftPanel';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { useIsMobile } from '../hooks/useWindowWidth';

type Tab = 'login' | 'signup';

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('login');
  const isMobile = useIsMobile();

  return (
    <div style={{
      minHeight: isMobile ? '100svh' : '100vh', display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    }}>
      {!isMobile && <LeftPanel />}

      <div style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: isMobile ? 'flex-start' : 'center',
        padding: isMobile ? '32px 20px' : '48px 56px',
        background: 'white', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 440, margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: '#F1F2F4', padding: 4, borderRadius: 12,
            marginBottom: 28,
          }}>
            <TabBtn active={tab === 'login'} onClick={() => setTab('login')}>Увійти</TabBtn>
            <TabBtn active={tab === 'signup'} onClick={() => setTab('signup')}>Зареєструватись</TabBtn>
          </div>

          <div style={{ marginBottom: 22 }}>
            <h2 style={{
              margin: 0, fontSize: 24, fontWeight: 700, color: '#0F172A',
              letterSpacing: '-0.025em', fontFamily: 'var(--auth-display)',
            }}>
              {tab === 'login' ? 'З поверненням' : 'Створити акаунт'}
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
              {tab === 'login'
                ? 'Увійдіть, щоб переглянути ваші заняття'
                : 'Приєднуйтесь до тисяч клієнтів та тренерів'}
            </p>
          </div>

          {tab === 'login' ? <LoginForm /> : <SignupForm />}

          <p style={{ marginTop: 28, fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
            {tab === 'login' ? (
              <>
                Ще немає акаунту?{' '}
                <button onClick={() => setTab('signup')} style={styles.linkBtn}>
                  Зареєструватись
                </button>
              </>
            ) : (
              <>
                Вже маєте акаунт?{' '}
                <button onClick={() => setTab('login')} style={styles.linkBtn}>
                  Увійти
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

interface TabBtnProps {
  active: boolean;
  onClick: () => void;
  children: string;
}

function TabBtn({ active, onClick, children }: TabBtnProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 12px', borderRadius: 9,
        background: active ? 'white' : 'transparent',
        color: active ? 'var(--auth-accent-700)' : '#6B7280',
        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 13.5, fontWeight: 600,
        boxShadow: active ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
        transition: 'all 140ms',
      }}
    >
      {children}
    </button>
  );
}

const styles: Record<string, CSSProperties> = {
  linkBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--auth-accent-700)', fontWeight: 600, fontSize: 13,
    fontFamily: 'inherit', padding: 0,
  },
};
