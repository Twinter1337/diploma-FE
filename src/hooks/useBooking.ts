import { useState } from 'react';
import type { CreateBookingResponse } from '../types';
import { useAuthContext } from '../contexts/AuthContext';
import { createBooking } from '../services/bookingService';

export function useCreateBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthContext();

  const create = async (
    slotId: string,
    serviceFee: number,
    totalAmount: number,
    reminderMinutes?: number,
  ): Promise<CreateBookingResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isAuthenticated) throw new Error('Будь ласка, увійдіть у свій акаунт.');
      return await createBooking(slotId, serviceFee, totalAmount, reminderMinutes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося забронювати. Спробуйте ще раз.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { create, isLoading, error };
}
