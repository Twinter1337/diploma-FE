import { useState, useEffect } from 'react';
import { getPlatformStats } from '../services/statsService';
import type { PlatformStats } from '../types';

export function useStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getPlatformStats()
      .then(setStats)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Не вдалося завантажити статистику.'))
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading, error };
}
