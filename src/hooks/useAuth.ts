import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../types';
import { UserRole } from '../types';
import * as authService from '../services/authService';
import { useAuthContext } from '../contexts/AuthContext';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (credentials: LoginRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      setAuth(data);
      const from = (location.state as { from?: Location } | null)?.from;
      const defaultDestination =
        data.user.role === UserRole.Admin ? '/admin' :
        data.user.role === UserRole.Trainer ? '/trainer' :
        '/search';
      const fromPath = from?.pathname ?? '';
      const isRoleSafeFrom =
        data.user.role === UserRole.Admin ? fromPath.startsWith('/admin') :
        data.user.role === UserRole.Trainer ? fromPath === '/trainer' :
        !fromPath.startsWith('/admin') && fromPath !== '/trainer';
      const target = from && isRoleSafeFrom
        ? `${from.pathname}${from.search}`
        : defaultDestination;
      navigate(target, { replace: true });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося увійти. Спробуйте ще раз.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuthContext();
  const navigate = useNavigate();

  const register = async (payload: RegisterRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.register(payload);
      setAuth(data);
      navigate(data.user.role === UserRole.Client ? '/onboarding' : '/trainer-onboarding');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зареєструватись. Спробуйте ще раз.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
}

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const requestReset = async (payload: ForgotPasswordRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(payload);
      setIsSuccess(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося надіслати запит. Спробуйте ще раз.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { requestReset, isLoading, error, isSuccess };
}

export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();

  const resetPassword = async (payload: ResetPasswordRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      await authService.resetPassword(payload);
      navigate('/auth', { replace: true });
      return true;
    } catch (err) {
      const e = err as Error & { errors?: Record<string, string[]> };
      if (e.errors && Object.keys(e.errors).length > 0) {
        setFieldErrors(e.errors);
      } else {
        setError(e instanceof Error ? e.message : 'Не вдалося скинути пароль. Спробуйте ще раз.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { resetPassword, isLoading, error, fieldErrors };
}
