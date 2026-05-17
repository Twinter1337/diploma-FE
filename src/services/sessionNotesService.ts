import type { SessionNote } from '../types';
import { BASE_URL, authFetch, parseError } from './httpUtils';

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

export async function getSessionNotes(bookingId: string): Promise<SessionNote[]> {
  const res = await authFetch(
    `${BASE_URL}/api/session-notes?bookingId=${encodeURIComponent(bookingId)}`,
  );
  if (!res.ok) await parseError(res);
  return res.json() as Promise<SessionNote[]>;
}

export async function createSessionNote(
  payload: { bookingId: string; content: string; isPrivate: boolean },
): Promise<SessionNote> {
  const res = await authFetch(`${BASE_URL}/api/session-notes`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<SessionNote>;
}

export async function patchSessionNote(
  id: string,
  payload: { content?: string; isPrivate?: boolean },
): Promise<SessionNote> {
  const res = await authFetch(`${BASE_URL}/api/session-notes/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<SessionNote>;
}

export async function deleteSessionNote(id: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/session-notes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) await parseError(res);
}
