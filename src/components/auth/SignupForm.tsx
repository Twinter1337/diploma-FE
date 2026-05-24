import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { UserRole } from '../../types';
import Input from '../ui/Input';
import Icon from '../ui/Icon';
import EyeToggle from './EyeToggle';
import RoleTile from './RoleTile';
import PasswordStrength from './PasswordStrength';
import { useRegister } from '../../hooks/useAuth';

interface Fields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_FIELDS: Fields = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function SignupForm() {
  const [role, setRole] = useState<UserRole.Client | UserRole.Trainer>(UserRole.Client);
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [showPwd, setShowPwd] = useState(false);
  const { register, isLoading, error } = useRegister();

  const set = (key: keyof Fields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = !fields.email || EMAIL_RE.test(fields.email);
  const passwordsMatch = !fields.confirmPassword || fields.password === fields.confirmPassword;
  const isValid =
    !!fields.firstName &&
    !!fields.email &&
    EMAIL_RE.test(fields.email) &&
    !!fields.password &&
    fields.password === fields.confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await register({
      firstName: fields.firstName,
      lastName: fields.lastName,
      email: fields.email,
      password: fields.password,
      role,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 10, display: 'block' }}>
          Я приєднуюсь як
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <RoleTile
            active={role === UserRole.Client}
            onClick={() => setRole(UserRole.Client)}
            label="Я клієнт"
            sub="Шукаю тренера"
            icon={<Icon size={26} stroke={1.7} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2|M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
          />
          <RoleTile
            active={role === UserRole.Trainer}
            onClick={() => setRole(UserRole.Trainer)}
            label="Я тренер"
            sub="Хочу проводити заняття"
            icon={<Icon size={26} stroke={1.7} d="M6 4l3 1.5L6 7l-3-1.5L6 4z|M9 5.5L18 10l-9 4.5L0 10l9-4.5z|M3 14l6 3 6-3|M21 14l-6 3" />}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Ім'я" value={fields.firstName} onChange={(v) => set('firstName', v)} placeholder="Олена" />
        <Input label="Прізвище" value={fields.lastName} onChange={(v) => set('lastName', v)} placeholder="Коваленко" />
      </div>

      <div>
        <Input
          label="Електронна пошта"
          type="email"
          value={fields.email}
          onChange={(v) => set('email', v)}
          placeholder="you@example.com"
          leftIcon={<Icon d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z|M4 7l8 6 8-6" size={17} />}
          error={!emailValid}
        />
        {!emailValid && (
          <div style={{ marginTop: 4, fontSize: 12.5, color: '#DC2626' }}>Невірний формат пошти</div>
        )}
      </div>

      <div>
        <Input
          label="Пароль"
          type={showPwd ? 'text' : 'password'}
          value={fields.password}
          onChange={(v) => set('password', v)}
          placeholder="Мінімум 8 символів"
          leftIcon={<Icon d="M5 11h14v10H5z|M8 11V7a4 4 0 118 0v4" size={17} />}
          rightSlot={<EyeToggle show={showPwd} onToggle={() => setShowPwd((s) => !s)} />}
        />
        {fields.password && <PasswordStrength value={fields.password} />}
      </div>

      <Input
        label="Підтвердження паролю"
        type={showPwd ? 'text' : 'password'}
        value={fields.confirmPassword}
        onChange={(v) => set('confirmPassword', v)}
        placeholder="Введіть пароль ще раз"
        leftIcon={<Icon d="M5 11h14v10H5z|M8 11V7a4 4 0 118 0v4" size={17} />}
        error={!passwordsMatch}
      />
      {!passwordsMatch && (
        <div style={{ marginTop: -10, fontSize: 12.5, color: '#DC2626' }}>Паролі не співпадають</div>
      )}

      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: 8,
          background: '#FEF2F2', border: '1px solid #FCA5A5',
          fontSize: 13, color: '#DC2626',
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || isLoading}
        style={{
          ...styles.primaryBtn,
          opacity: isValid && !isLoading ? 1 : 0.55,
          cursor: isValid && !isLoading ? 'pointer' : 'not-allowed',
        }}
      >
        {isLoading ? 'Реєстрація…' : 'Зареєструватись'}
      </button>
    </form>
  );
}

const styles: Record<string, CSSProperties> = {
  link: {
    color: 'var(--auth-accent-700)', fontWeight: 600, textDecoration: 'none',
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
