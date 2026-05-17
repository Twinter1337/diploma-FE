import type {
  Gender, SlotFormat, DocumentType, Tag, TrainerDocument,
  TrainerProfile, TrainerAvailableSlot, TrainerProfileReview,
  TrainerDashboardSlot, TrainerSlotCount, TrainerSlotFilters, TrainerBooking, TrainerClient,
  TrainerStats, PatchSlotPayload, PatchSlotResponse,
} from '../types';
import { BASE_URL, authFetch, parseError } from './httpUtils';

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

export interface PatchTrainerStep1Payload {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  city: string;
  gender: Gender;
  birthDate: string;
  bio: string;
}

export interface PatchTrainerStep2Payload {
  experienceYears: number;
  specializationTagIds: number[];
  methodologyTagIds: number[];
  hasAccess: boolean;
  accessTagIds: number[];
}

export interface PostTrainerDocumentPayload {
  file: File;
  documentType: DocumentType;
}

export interface TrainerDocumentResponse {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  documentType: DocumentType;
  fileUrl: string;
}

export interface PostTrainerSlotPayload {
  startTime: string;
  endTime: string;
  format: SlotFormat;
  pricePerSession: number;
  maxClients: number;
}

export interface TrainerSlotResponse {
  id: string;
  trainerId: string;
  startTime: string;
  endTime: string;
  format: SlotFormat;
  price: number;
  maxClients: number;
  status: number;
  createdAt: string;
}

export async function patchTrainerStep1(
  trainerId: string,
  payload: PatchTrainerStep1Payload,
): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/trainers/${trainerId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
}

export async function patchTrainerStep2(
  trainerId: string,
  payload: PatchTrainerStep2Payload,
): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/trainers/${trainerId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
}

export async function postTrainerDocument(
  trainerId: string,
  payload: PostTrainerDocumentPayload,
): Promise<TrainerDocumentResponse> {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('documentType', String(payload.documentType));
  const res = await authFetch(`${BASE_URL}/api/trainers/${trainerId}/documents`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<TrainerDocumentResponse>;
}

export async function postTrainerSlot(
  trainerId: string,
  payload: PostTrainerSlotPayload,
): Promise<TrainerSlotResponse> {
  const res = await authFetch(`${BASE_URL}/api/trainers/${trainerId}/slots`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<TrainerSlotResponse>;
}

export async function getSpecializationTags(): Promise<Tag[]> {
  const res = await fetch(`${BASE_URL}/api/tags?category=0`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<Tag[]>;
}

export async function getMethodologyTags(): Promise<Tag[]> {
  const res = await fetch(`${BASE_URL}/api/tags?category=2`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<Tag[]>;
}

export async function getDisabilityTags(): Promise<Tag[]> {
  const res = await fetch(`${BASE_URL}/api/tags?category=1`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<Tag[]>;
}

export async function getTrainerProfile(trainerId: string): Promise<TrainerProfile> {
  const res = await fetch(`${BASE_URL}/api/trainers/${trainerId}`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<TrainerProfile>;
}

export async function getTrainerSlots(trainerId: string): Promise<TrainerAvailableSlot[]> {
  const res = await fetch(`${BASE_URL}/api/trainers/${trainerId}/slots?isTrainer=false`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<TrainerAvailableSlot[]>;
}

export async function getTrainerReviews(trainerId: string): Promise<TrainerProfileReview[]> {
  const res = await fetch(`${BASE_URL}/api/trainers/${trainerId}/reviews`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<TrainerProfileReview[]>;
}

export async function getTrainerDashboardSlots(
  trainerId: string,
  filters: TrainerSlotFilters = {},
): Promise<TrainerDashboardSlot[]> {
  const params = new URLSearchParams({ isTrainer: 'true' });
  if (filters.isClosed) params.set('isClosed', 'true');
  if (filters.isReserved) params.set('isReserved', 'true');
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.timeFrom) params.set('timeFrom', filters.timeFrom);
  if (filters.timeTo) params.set('timeTo', filters.timeTo);
  const res = await authFetch(`${BASE_URL}/api/trainers/${trainerId}/slots?${params}`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<TrainerDashboardSlot[]>;
}

export async function getTrainerSlotCount(trainerId: string): Promise<TrainerSlotCount> {
  const res = await fetch(`${BASE_URL}/api/trainers/${trainerId}/slot-count`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<TrainerSlotCount>;
}

export async function getTrainerBookings(trainerId: string): Promise<TrainerBooking[]> {
  const res = await authFetch(`${BASE_URL}/api/trainers/${trainerId}/bookings`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<TrainerBooking[]>;
}

export async function getTrainerClients(trainerId: string): Promise<TrainerClient[]> {
  const res = await authFetch(`${BASE_URL}/api/trainers/${trainerId}/clients`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<TrainerClient[]>;
}

export async function getClientBookingsForTrainer(
  trainerId: string,
  clientId: string,
): Promise<TrainerBooking[]> {
  const res = await authFetch(
    `${BASE_URL}/api/trainers/${trainerId}/clients/${clientId}/bookings?status=3&pageSize=50`,
  );
  if (!res.ok) await parseError(res);
  const data = await res.json() as { items: TrainerBooking[] };
  return data.items;
}

export async function getTrainerStats(trainerId: string): Promise<TrainerStats> {
  const res = await authFetch(`${BASE_URL}/api/trainers/${trainerId}/stats`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<TrainerStats>;
}

export async function patchSlot(
  slotId: string,
  payload: PatchSlotPayload,
): Promise<PatchSlotResponse> {
  const res = await authFetch(`${BASE_URL}/api/slots/${slotId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<PatchSlotResponse>;
}

export async function deleteTrainerSlot(
  trainerId: string,
  slotId: string,
): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/trainers/${trainerId}/slots/${slotId}`, {
    method: 'DELETE',
  });
  if (!res.ok) await parseError(res);
}

export async function getTrainerDocuments(trainerId: string): Promise<TrainerDocument[]> {
  const res = await authFetch(`${BASE_URL}/api/trainers/${trainerId}/documents`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<TrainerDocument[]>;
}

export async function deleteTrainerDocument(
  trainerId: string,
  docId: string,
): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/trainers/${trainerId}/documents/${docId}`, {
    method: 'DELETE',
  });
  if (!res.ok) await parseError(res);
}
