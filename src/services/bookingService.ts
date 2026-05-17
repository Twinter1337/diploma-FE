import type { CreateBookingResponse } from '../types';
import { BASE_URL, authFetch, parseError } from './httpUtils';

export async function createBooking(
  slotId: string,
  serviceFee: number,
  totalAmount: number,
  reminderMinutes?: number,
): Promise<CreateBookingResponse> {
  const body: Record<string, unknown> = { slotId, serviceFee, totalAmount };
  if (reminderMinutes !== undefined) body.reminderMinutes = reminderMinutes;

  const res = await authFetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<CreateBookingResponse>;
}
