import type {
  Gender,
  Tag,
  ClientProfileData,
  ClientBooking,
  BookingHistoryItem,
  UserAchievementsResponse,
  PostReviewResponse,
} from '../types';
import { BASE_URL, authFetch, parseError } from './httpUtils';

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

export interface PatchClientStep1Payload {
  avatarUrl: string;
  city: string;
  about: string;
}

export interface PatchClientStep2Payload {
  heightCm: number;
  weightKg: number;
  gender: Gender;
  birthDate: string;
  accessTagIds: number[];
}

export interface PatchClientSettingsPayload {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  heightCm?: number;
  weightKg?: number;
  gender?: Gender;
  birthDate?: string;
  accessTagIds?: number[];
}

export interface CancelBookingResponse {
  bookingId: string;
  status: number;
  refundAmount: number;
  refundPercentage: number;
}

export async function patchClientStep1(
  clientId: string,
  payload: PatchClientStep1Payload,
): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/clients/${clientId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
}

export async function patchClientStep2(
  clientId: string,
  payload: PatchClientStep2Payload,
): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/clients/${clientId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
}

export async function getDisabilityTags(): Promise<Tag[]> {
  const res = await fetch(`${BASE_URL}/api/tags?category=1`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<Tag[]>;
}

export async function getClientProfile(userId: string): Promise<ClientProfileData> {
  const res = await authFetch(`${BASE_URL}/api/users/${userId}`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<ClientProfileData>;
}

export async function getClientBookings(userId: string): Promise<ClientBooking[]> {
  const res = await authFetch(`${BASE_URL}/api/users/${userId}/bookings`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<ClientBooking[]>;
}

export async function getBookingHistory(userId: string): Promise<BookingHistoryItem[]> {
  const res = await authFetch(`${BASE_URL}/api/users/${userId}/booking-history`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<BookingHistoryItem[]>;
}

export async function getClientAchievements(
  userId: string,
): Promise<UserAchievementsResponse> {
  const res = await authFetch(`${BASE_URL}/api/users/${userId}/achievements`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<UserAchievementsResponse>;
}

export async function postReview(
  bookingId: string,
  rating: number,
  comment: string,
): Promise<PostReviewResponse> {
  const res = await authFetch(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ bookingId, rating, comment }),
  });
  if (res.status === 409) throw new Error('ALREADY_REVIEWED');
  if (!res.ok) await parseError(res);
  return res.json() as Promise<PostReviewResponse>;
}

export async function patchClientSettings(
  clientId: string,
  payload: PatchClientSettingsPayload,
): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/clients/${clientId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
}

export interface PatchUserPayload {
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  birthDate?: string | null;
}

export async function patchUser(
  userId: string,
  payload: PatchUserPayload,
): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/users/${userId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
}

export async function cancelBooking(bookingId: string): Promise<CancelBookingResponse> {
  const res = await authFetch(`${BASE_URL}/api/bookings/${bookingId}`, {
    method: 'DELETE',
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<CancelBookingResponse>;
}

export interface RetryPaymentResponse {
  bookingId: string;
  checkoutUrl: string;
  status: number;
  serviceFeeApplied: boolean;
  totalAmount: number;
}

export async function retryPayment(bookingId: string): Promise<RetryPaymentResponse> {
  const res = await authFetch(`${BASE_URL}/api/bookings/${bookingId}/retry-payment`, {
    method: 'POST',
  });
  if (res.status === 409) throw new Error('BOOKING_NOT_PENDING');
  if (!res.ok) await parseError(res);
  return res.json() as Promise<RetryPaymentResponse>;
}

export async function deleteAccount(userId: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/users/${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) await parseError(res);
}
