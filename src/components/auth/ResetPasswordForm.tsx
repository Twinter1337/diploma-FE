import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Input from '../ui/Input';
import Icon from '../ui/Icon';
import EyeToggle from './EyeToggle';
import PasswordStrength from './PasswordStrength';
import { useResetPassword } from '../../hooks/useAuth';

interface ResetPasswordFormProps {
  token: string;
}

interface ClientErrors {
  newPassword?: string;
  confirmPassword?: string;
}

function pickServerError(
  fieldErrors: Record<string, string[]>,
  key: string,
): string | undefined {
  const keyLower = key.toLowerCase();
  for (const k of Object.keys(fieldErrors)) {
    if (k.toLowerCase() === keyLower) {
      const arr = fieldErrors[k];
      if (Array.isArray(arr) && arr.length > 0) return arr[0];
    }
  }
  return undefined;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});
  const { resetPassword, isLoading, error, fieldErrors } = useResetPassword();

  const validate = () => {
    const errs: ClientErrors = {};
    if (!newPassword) errs.newPassword = 'Введіть новий пароль';
    else if (newPassword.length < 8) errs.newPassword = 'Пароль має містити щонайменше 8 символів';
    else if (newPassword.length > 100) errs.newPassword = 'Пароль занадто довгий (максимум 100 символів)';
    if (!confirmPassword) errs.confirmPassword = 'Підтвердіть пароль';
    else if (confirmPassword !== newPassword) errs.confirmPassword = 'Паролі не співпадають';
    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await resetPassword({ token, newPassword, confirmPassword });
  };

  const newPwdError = clientErrors.newPassword ?? pickServerError(fieldErrors, 'NewPassword');
  const confirmPwdError = clientErrors.confirmPassword ?? pickServerError(fieldErrors, 'ConfirmPassword');

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <Input
          label="Новий пароль"
          type={showNew ? 'text' : 'password'}
          value={newPassword}
          onChange={(v) => { setNewPassword(v); setClientErrors((c) => ({ ...c, newPassword: undefined })); }}
          placeholder="Введіть новий пароль"
          autoFocus
          leftIcon={<Icon d="M5 11h14v10H5z|M8 11V7a4 4 0 118 0v4" size={17} />}
          rightSlot={<EyeToggle show={showNew} onToggle={() => setShowNew((s) => !s)} />}
          error={!!newPwdError}
        />
        {newPwdError && <div style={styles.fieldError}>{newPwdError}</div>}
        {newPassword && <PasswordStrength value={newPassword} />}
      </div>

      <div>
        <Input
          label="Підтвердження пароля"
          type={showConfirm ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(v) => { setConfirmPassword(v); setClientErrors((c) => ({ ...c, confirmPassword: undefined })); }}
          placeholder="Повторіть новий пароль"
          leftIcon={<Icon d="M5 11h14v10H5z|M8 11V7a4 4 0 118 0v4" size={17} />}
          rightSlot={<EyeToggle show={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />}
          error={!!confirmPwdError}
        />
        {confirmPwdError && <div style={styles.fieldError}>{confirmPwdError}</div>}
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <div>{error}</div>
          <Link to="/forgot-password" style={styles.bannerLink}>Запросити нове посилання</Link>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        style={{ ...styles.primaryBtn, opacity: isLoading ? 0.7 : 1 }}
      >
        {isLoading ? 'Зберігаємо…' : 'Зберегти новий пароль'}
      </button>
    </form>
  );
}

const styles: Record<string, CSSProperties> = {
  fieldError: {
    marginTop: 4, fontSize: 12.5, color: '#DC2626',
  },
  errorBanner: {
    padding: '10px 14px', borderRadius: 8,
    background: '#FEF2F2', border: '1px solid #FCA5A5',
    fontSize: 13, color: '#DC2626',
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  bannerLink: {
    color: '#DC2626', fontWeight: 700, textDecoration: 'underline', fontSize: 13,
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
