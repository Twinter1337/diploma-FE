import { useState } from 'react';
import type { SupportTicket } from '../types';
import { useAuthContext } from '../contexts/AuthContext';
import { createBookingTicket } from '../services/ticketService';

export function useBookingTicket() {
  const { isAuthenticated } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (
    bookingId: string,
    subject: string,
    description: string,
  ): Promise<SupportTicket | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (!isAuthenticated) throw new Error('Будь ласка, увійдіть у свій акаунт.');
      return await createBookingTicket({ bookingId, subject, description });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося відкрити спір. Спробуйте ще раз.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, error, clearError: () => setError(null) };
}
