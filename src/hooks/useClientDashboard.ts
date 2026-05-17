import { useState, useEffect, useCallback } from 'react';
import type {
  ClientProfileData,
  ClientBooking,
  BookingHistoryItem,
  UserAchievementsResponse,
} from '../types';
import { BookingStatus } from '../types';
import { useAuthContext } from '../contexts/AuthContext';
import * as clientService from '../services/clientService';
import * as userService from '../services/userService';

export interface SettingsFields {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  heightCm: string;
  weightKg: string;
  selectedTagIds: number[];
}

export function useClientDashboard() {
  const { user, logout } = useAuthContext();

  const [profile, setProfile] = useState<ClientProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const [history, setHistory] = useState<BookingHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [achievements, setAchievements] = useState<UserAchievementsResponse | null>(null);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [achievementsError, setAchievementsError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [retryingPaymentId, setRetryingPaymentId] = useState<string | null>(null);
  const [lateFeeCheckout, setLateFeeCheckout] = useState<{ bookingId: string; checkoutUrl: string; totalAmount: number } | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setBookingsLoading(true);
    try {
      const data = await clientService.getClientBookings(user.id);
      setBookings(data.filter(b => b.status === BookingStatus.Pending || b.status === BookingStatus.Confirmed));
    } catch (e) {
      setBookingsError(e instanceof Error ? e.message : 'Не вдалося завантажити заняття. Спробуйте оновити сторінку.');
    } finally {
      setBookingsLoading(false);
    }
  }, [user]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const data = await clientService.getClientProfile(user.id);
      setProfile(data);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : 'Не вдалося завантажити профіль. Спробуйте оновити сторінку.');
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const id = user.id;

    setProfileLoading(true);
    setBookingsLoading(true);
    setHistoryLoading(true);
    setAchievementsLoading(true);

    const [profileRes, bookingsRes, historyRes, achievementsRes] = await Promise.allSettled([
      clientService.getClientProfile(id),
      clientService.getClientBookings(id),
      clientService.getBookingHistory(id),
      clientService.getClientAchievements(id),
    ]);

    if (profileRes.status === 'fulfilled') {
      setProfile(profileRes.value);
    } else {
      setProfileError(profileRes.reason instanceof Error ? profileRes.reason.message : 'Не вдалося завантажити профіль. Спробуйте оновити сторінку.');
    }
    setProfileLoading(false);

    if (bookingsRes.status === 'fulfilled') {
      setBookings(bookingsRes.value.filter(b => b.status === BookingStatus.Pending || b.status === BookingStatus.Confirmed));
    } else {
      setBookingsError(bookingsRes.reason instanceof Error ? bookingsRes.reason.message : 'Не вдалося завантажити заняття. Спробуйте оновити сторінку.');
    }
    setBookingsLoading(false);

    if (historyRes.status === 'fulfilled') {
      setHistory(historyRes.value);
    } else {
      setHistoryError(historyRes.reason instanceof Error ? historyRes.reason.message : 'Не вдалося завантажити історію. Спробуйте оновити сторінку.');
    }
    setHistoryLoading(false);

    if (achievementsRes.status === 'fulfilled') {
      setAchievements(achievementsRes.value);
    } else {
      setAchievementsError(achievementsRes.reason instanceof Error ? achievementsRes.reason.message : 'Не вдалося завантажити досягнення. Спробуйте оновити сторінку.');
    }
    setAchievementsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;
    setIsUploadingAvatar(true);
    try {
      const { avatarUrl } = await userService.uploadAvatar(user.id, file);
      setProfile(prev => prev ? { ...prev, avatarUrl } : prev);
      return avatarUrl;
    } catch {
      return null;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const deleteAvatar = async (): Promise<boolean> => {
    if (!user) return false;
    setIsDeletingAvatar(true);
    try {
      await userService.deleteAvatar(user.id);
      setProfile(prev => prev ? { ...prev, avatarUrl: null } : prev);
      return true;
    } catch {
      return false;
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  const saveSettings = async (fields: SettingsFields): Promise<boolean> => {
    if (!user) return false;

    if (!fields.firstName.trim()) { setSaveError("Введіть ім'я"); return false; }
    if (!fields.lastName.trim()) { setSaveError('Введіть прізвище'); return false; }
    if (!fields.email.trim()) { setSaveError('Введіть email'); return false; }
    if (!fields.city.trim()) { setSaveError('Вкажіть місто'); return false; }
    const isAdmin = user.role === 2;
    const heightCm = parseFloat(fields.heightCm);
    const weightKg = parseFloat(fields.weightKg);
    if (!isAdmin) {
      if (isNaN(heightCm) || heightCm < 50 || heightCm > 300) { setSaveError('Зріст має бути від 50 до 300 см'); return false; }
      if (isNaN(weightKg) || weightKg < 1 || weightKg > 500) { setSaveError('Вага має бути від 1 до 500 кг'); return false; }
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      if (isAdmin) {
        await clientService.patchUser(user.id, {
          firstName: fields.firstName.trim(),
          lastName: fields.lastName.trim(),
          city: fields.city.trim(),
        });
      } else {
        await clientService.patchClientSettings(user.id, {
          firstName: fields.firstName.trim(),
          lastName: fields.lastName.trim(),
          email: fields.email.trim(),
          city: fields.city.trim(),
          heightCm,
          weightKg,
          gender: user.gender ?? 2,
          birthDate: user.birthDate ?? '',
          accessTagIds: fields.selectedTagIds,
        });
      }
      await fetchProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Не вдалося зберегти зміни. Спробуйте ще раз.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const submitReview = async (
    bookingId: string,
    _trainerFullName: string,
    rating: number,
    comment: string,
  ): Promise<boolean> => {
    try {
      const created = await clientService.postReview(bookingId, rating, comment);
      setHistory(prev =>
        prev.map(item =>
          item.id === bookingId
            ? { ...item, review: { rating: created.rating, comment: created.comment } }
            : item,
        ),
      );
      return true;
    } catch (err) {
      if (err instanceof Error && err.message === 'ALREADY_REVIEWED') {
        const id = user?.id;
        if (id) {
          const fresh = await clientService.getBookingHistory(id);
          setHistory(fresh);
        }
        return true;
      }
      return false;
    }
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    setCancellingId(bookingId);
    try {
      await clientService.cancelBooking(bookingId);
      await fetchBookings();
      return true;
    } catch {
      return false;
    } finally {
      setCancellingId(null);
    }
  };

  const retryPayment = async (bookingId: string): Promise<void> => {
    setRetryingPaymentId(bookingId);
    try {
      const result = await clientService.retryPayment(bookingId);
      if (result.serviceFeeApplied) {
        setLateFeeCheckout({ bookingId, checkoutUrl: result.checkoutUrl, totalAmount: result.totalAmount });
      } else {
        window.location.href = result.checkoutUrl;
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'BOOKING_NOT_PENDING') {
        await fetchBookings();
      }
    } finally {
      setRetryingPaymentId(null);
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!user) return false;
    setIsDeletingAccount(true);
    try {
      await clientService.deleteAccount(user.id);
      logout();
      return true;
    } catch {
      setIsDeletingAccount(false);
      return false;
    }
  };

  return {
    profile,
    profileLoading,
    profileError,
    bookings,
    bookingsLoading,
    bookingsError,
    history,
    historyLoading,
    historyError,
    achievements,
    achievementsLoading,
    achievementsError,
    isSaving,
    saveError,
    saveSuccess,
    isUploadingAvatar,
    isDeletingAvatar,
    cancellingId,
    retryingPaymentId,
    lateFeeCheckout,
    isDeletingAccount,
    uploadAvatar,
    deleteAvatar,
    saveSettings,
    submitReview,
    cancelBooking,
    retryPayment,
    confirmLateFeePayment: () => {
      if (lateFeeCheckout) window.location.href = lateFeeCheckout.checkoutUrl;
    },
    dismissLateFeeWarning: () => setLateFeeCheckout(null),
    deleteAccount,
    clearSaveError: () => setSaveError(null),
  };
}
