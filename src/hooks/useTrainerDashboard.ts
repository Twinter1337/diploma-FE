import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  TrainerDashboardSlot,
  TrainerSlotCount,
  TrainerSlotFilters,
  TrainerBooking,
  TrainerClient,
  TrainerStats,
  TrainerProfileReview,
  PatchSlotPayload,
} from '../types';
import { SlotStatus } from '../types';
import type { PostTrainerSlotPayload } from '../services/trainerService';
import {
  getTrainerDashboardSlots,
  getTrainerSlotCount,
  getTrainerBookings,
  getTrainerClients,
  getTrainerStats,
  getTrainerReviews,
  patchSlot as patchSlotService,
  postTrainerSlot,
  deleteTrainerSlot,
} from '../services/trainerService';

export interface UseTrainerDashboardResult {
  slots: TrainerDashboardSlot[];
  slotCount: TrainerSlotCount | null;
  bookings: TrainerBooking[];
  clients: TrainerClient[];
  stats: TrainerStats | null;
  reviews: TrainerProfileReview[];
  isLoading: boolean;
  error: string | null;
  slotFilters: TrainerSlotFilters;
  setSlotFilters: (filters: TrainerSlotFilters) => void;
  updateSlot: (slotId: string, payload: PatchSlotPayload) => Promise<void>;
  createSlot: (payload: PostTrainerSlotPayload) => Promise<void>;
  deleteSlot: (slotId: string) => Promise<void>;
}

export function useTrainerDashboard(trainerId: string): UseTrainerDashboardResult {
  const [slots, setSlots] = useState<TrainerDashboardSlot[]>([]);
  const [slotCount, setSlotCount] = useState<TrainerSlotCount | null>(null);
  const [bookings, setBookings] = useState<TrainerBooking[]>([]);
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [reviews, setReviews] = useState<TrainerProfileReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slotFilters, setSlotFilters] = useState<TrainerSlotFilters>({});
  const filtersApplied = useRef(false);

  useEffect(() => {
    if (!trainerId) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      getTrainerDashboardSlots(trainerId, {}),
      getTrainerSlotCount(trainerId),
      getTrainerBookings(trainerId),
      getTrainerClients(trainerId),
      getTrainerStats(trainerId),
      getTrainerReviews(trainerId),
    ])
      .then(([s, sc, b, c, st, r]) => {
        setSlots(s);
        setSlotCount(sc);
        setBookings(b);
        setClients(c);
        setStats(st);
        setReviews(r);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [trainerId]);

  const updateSlot = useCallback(async (slotId: string, payload: PatchSlotPayload): Promise<void> => {
    const updated = await patchSlotService(slotId, payload);
    const durationInMinutes = Math.round(
      (new Date(updated.endTime).getTime() - new Date(updated.startTime).getTime()) / 60000,
    );
    setSlots(prev => prev.map(s => s.id !== slotId ? s : {
      ...s,
      startDateTime: updated.startTime,
      durationInMinutes,
      format: updated.format,
      price: updated.price,
      maxClients: updated.maxClients,
    }));
  }, []);

  const createSlot = useCallback(async (payload: PostTrainerSlotPayload): Promise<void> => {
    const created = await postTrainerSlot(trainerId, payload);
    const durationInMinutes = Math.round(
      (new Date(created.endTime).getTime() - new Date(created.startTime).getTime()) / 60000,
    );
    const newSlot: TrainerDashboardSlot = {
      id: created.id,
      startDateTime: created.startTime,
      durationInMinutes,
      format: created.format,
      price: created.price,
      maxClients: created.maxClients,
      currentNumOfClients: 0,
    };
    setSlots(prev => [...prev, newSlot].sort(
      (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
    ));
    setSlotCount(prev => prev ? { ...prev, numOfAllSlots: prev.numOfAllSlots + 1 } : prev);
  }, [trainerId]);

  const deleteSlot = useCallback(async (slotId: string): Promise<void> => {
    await deleteTrainerSlot(trainerId, slotId);
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status: SlotStatus.Cancelled } : s));
  }, [trainerId]);

  useEffect(() => {
    if (!filtersApplied.current) {
      filtersApplied.current = true;
      return;
    }
    if (!trainerId) return;
    getTrainerDashboardSlots(trainerId, slotFilters)
      .then(setSlots)
      .catch((e: Error) => setError(e.message));
  }, [slotFilters, trainerId]);

  return { slots, slotCount, bookings, clients, stats, reviews, isLoading, error, slotFilters, setSlotFilters, updateSlot, createSlot, deleteSlot };
}
