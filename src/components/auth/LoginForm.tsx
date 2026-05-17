import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Input from '../ui/Input';
import Icon from '../ui/Icon';
import EyeToggle from './EyeToggle';
import { useLogin } from '../../hooks/useAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const { login, isLoading, error } = useLogin();

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'Введіть електронну пошту';
    else if (!EMAIL_RE.test(email)) errs.email = 'Невірний формат пошти';
    if (!password) errs.password = 'Введіть пароль';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <Input
          label="Електронна пошта"
          type="email"
          value={email}
          onChange={(v) => { setEmail(v); setFieldErrors((e) => ({ ...e, email: undefined })); }}
          placeholder="you@example.com"
          autoFocus
          leftIcon={<Icon d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z|M4 7l8 6 8-6" size={17} />}
          error={!!fieldErrors.email}
        />
        {fieldErrors.email && <div style={styles.fieldError}>{fieldErrors.email}</div>}
      </div>

      <div>
        <Input
          label="Пароль"
          type={showPwd ? 'text' : 'password'}
          value={password}
          onChange={(v) => { setPassword(v); setFieldErrors((e) => ({ ...e, password: undefined })); }}
          placeholder="Введіть пароль"
          leftIcon={<Icon d="M5 11h14v10H5z|M8 11V7a4 4 0 118 0v4" size={17} />}
          rightSlot={<EyeToggle show={showPwd} onToggle={() => setShowPwd((s) => !s)} />}
          error={!!fieldErrors.password}
        />
        {fieldErrors.password && <div style={styles.fieldError}>{fieldErrors.password}</div>}
        <Link to="/forgot-password" style={styles.link}>Забули пароль?</Link>
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <button
        type="submit"
        disabled={isLoading}
        style={{ ...styles.primaryBtn, opacity: isLoading ? 0.7 : 1 }}
      >
        {isLoading ? 'Вхід…' : 'Увійти'}
      </button>
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
  link: {
    fontSize: 13, color: 'var(--auth-accent-700)',
    textDecoration: 'none', fontWeight: 600,
    display: 'block', marginTop: 6,
  },
  fieldError: {
    marginTop: 4, fontSize: 12.5, color: '#DC2626',
  },
  primaryBtn: {
    width: '100%', padding: '13px 16px',
    background: 'var(--auth-accent-600)', color: 'white',
    border: 'none', borderRadius: 10,
    fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 2px 8px var(--auth-accent-shadow)',
    transition: 'background 120ms, transform 80ms',
  },
};
