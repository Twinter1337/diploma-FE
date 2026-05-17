import { useState, useEffect, useCallback } from 'react';
import type { TrainerProfile, TrainerAvailableSlot, TrainerProfileReview } from '../types';
import { getTrainerProfile, getTrainerSlots, getTrainerReviews } from '../services/trainerService';

interface UseTrainerProfileResult {
  profile: TrainerProfile | null;
  slots: TrainerAvailableSlot[];
  reviews: TrainerProfileReview[];
  isLoading: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
  refetchSlots: () => Promise<void>;
}

export function useTrainerProfile(trainerId: string): UseTrainerProfileResult {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [slots, setSlots] = useState<TrainerAvailableSlot[]>([]);
  const [reviews, setReviews] = useState<TrainerProfileReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trainerId) return;
    setIsLoading(true);
    setError(null);

    Promise.all([
      getTrainerProfile(trainerId),
      getTrainerSlots(trainerId),
      getTrainerReviews(trainerId),
    ])
      .then(([p, s, r]) => {
        setProfile(p);
        setSlots(s);
        setReviews(r);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [trainerId]);

  const refetchProfile = useCallback(async () => {
    if (!trainerId) return;
    try {
      const p = await getTrainerProfile(trainerId);
      setProfile(p);
    } catch {
      // keep existing profile on refetch error
    }
  }, [trainerId]);

  const refetchSlots = useCallback(async () => {
    if (!trainerId) return;
    try {
      const s = await getTrainerSlots(trainerId);
      setSlots(s);
    } catch {
      // keep existing slots on refetch error
    }
  }, [trainerId]);

  return { profile, slots, reviews, isLoading, error, refetchProfile, refetchSlots };
}
