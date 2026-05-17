import { useState, useEffect } from 'react';

const PAYMENT_WINDOW_MS = 15 * 60 * 1000;

export function usePaymentCountdown(createdAt: string): { label: string; expired: boolean } {
  const expiresAt = new Date(createdAt).getTime() + PAYMENT_WINDOW_MS;

  const getRemaining = () => Math.max(0, expiresAt - Date.now());

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    if (remaining === 0) return;
    const id = setInterval(() => {
      const r = getRemaining();
      setRemaining(r);
      if (r === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const expired = remaining === 0;
  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  const label = expired
    ? 'Час вийшов'
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return { label, expired };
}
