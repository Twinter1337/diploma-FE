import type { SupportTicket } from '../types';
import { BASE_URL, authFetch, parseError } from './httpUtils';

export interface CreateBookingTicketPayload {
  bookingId: string;
  subject: string;
  description: string;
}

export async function createBookingTicket(
  payload: CreateBookingTicketPayload,
): Promise<SupportTicket> {
  const res = await authFetch(`${BASE_URL}/api/tickets/booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<SupportTicket>;
}
