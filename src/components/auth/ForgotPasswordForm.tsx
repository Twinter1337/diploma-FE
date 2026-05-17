import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Input from '../ui/Input';
import Icon from '../ui/Icon';
import { useForgotPassword } from '../../hooks/useAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const { requestReset, isLoading, error, isSuccess } = useForgotPassword();

  const validate = () => {
    if (!email) { setFieldError('Введіть електронну пошту'); return false; }
    if (email.length > 255) { setFieldError('Пошта занадто довга'); return false; }
    if (!EMAIL_RE.test(email)) { setFieldError('Невірний формат пошти'); return false; }
    setFieldError(undefined);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await requestReset({ email });
  };

  if (isSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={styles.successBanner}>
          Якщо обліковий запис існує для цієї пошти, ми надіслали посилання для скидання пароля. Перевірте вашу поштову скриньку.
        </div>
        <Link to="/auth" style={styles.linkBtn}>Повернутись до входу</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <Input
          label="Електронна пошта"
          type="email"
          value={email}
          onChange={(v) => { setEmail(v); setFieldError(undefined); }}
          placeholder="you@example.com"
          autoFocus
          leftIcon={<Icon d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z|M4 7l8 6 8-6" size={17} />}
          error={!!fieldError}
        />
        {fieldError && <div style={styles.fieldError}>{fieldError}</div>}
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <button
        type="submit"
        disabled={isLoading}
        style={{ ...styles.primaryBtn, opacity: isLoading ? 0.7 : 1 }}
      >
        {isLoading ? 'Надсилаємо…' : 'Надіслати посилання'}
      </button>

      <Link to="/auth" style={{ ...styles.linkBtn, textAlign: 'center' }}>Повернутись до входу</Link>
    </form>
  );
}

function ErrorBanner({ children }: { children: string }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 8,
      background: '#FEF2F2', border: '1px solid #FCA5A5',
      fontSize: 13, color: '#DC2626',
    }}>
      {children}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  fieldError: {
    marginTop: 4, fontSize: 12.5, color: '#DC2626',
  },
  successBanner: {
    padding: '14px 16px', borderRadius: 10,
    background: '#ECFDF5', border: '1px solid #A7F3D0',
    fontSize: 13.5, color: '#065F46', lineHeight: 1.5,
  },
  primaryBtn: {
    width: '100%', padding: '13px 16px',
    background: 'var(--auth-accent-600)', color: 'white',
    border: 'none', borderRadius: 10,
    fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 2px 8px var(--auth-accent-shadow)',
    transition: 'background 120ms, transform 80ms',
  },
  linkBtn: {
    fontSize: 13, color: 'var(--auth-accent-700)',
    textDecoration: 'none', fontWeight: 600,
  },
};
