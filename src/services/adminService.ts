import type {
  AdminAssignee,
  AdminDocReviewResponse,
  AdminStats,
  AdminTicketDetail,
  AdminTicketKanbanStatus,
  AdminTicketsPage,
  AdminTicketsQuery,
  PatchAdminTicketPayload,
} from '../types';
import { BASE_URL, authFetch, parseError } from './httpUtils';

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

export const KANBAN_STATUSES: readonly AdminTicketKanbanStatus[] = [
  'open',
  'in_progress',
  'resolved',
  'closed',
];

export function statusIntToKey(s: number): AdminTicketKanbanStatus {
  return KANBAN_STATUSES[s] ?? 'open';
}

export function statusKeyToInt(k: AdminTicketKanbanStatus): number {
  return KANBAN_STATUSES.indexOf(k);
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await authFetch(`${BASE_URL}/api/admin/stats`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<AdminStats>;
}

export async function listAdminTickets(
  query: AdminTicketsQuery = {},
): Promise<AdminTicketsPage> {
  const params = new URLSearchParams();
  if (query.type && query.type !== 'all') params.set('type', query.type);
  if (query.assignedTo) params.set('assignedTo', query.assignedTo);
  if (query.search) params.set('search', query.search);
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  const qs = params.toString();
  const res = await authFetch(`${BASE_URL}/api/admin/support-tickets${qs ? `?${qs}` : ''}`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<AdminTicketsPage>;
}

export async function getAdminTicket(id: string): Promise<AdminTicketDetail> {
  const res = await authFetch(`${BASE_URL}/api/admin/support-tickets/${id}`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<AdminTicketDetail>;
}

export async function patchAdminTicket(
  id: string,
  payload: PatchAdminTicketPayload,
): Promise<AdminTicketDetail> {
  const res = await authFetch(`${BASE_URL}/api/admin/support-tickets/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<AdminTicketDetail>;
}

export async function listAdminUsers(): Promise<AdminAssignee[]> {
  const res = await authFetch(`${BASE_URL}/api/admin/users`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<AdminAssignee[]>;
}

export async function approveTrainerDocument(
  docId: string,
): Promise<AdminDocReviewResponse> {
  const res = await authFetch(`${BASE_URL}/api/admin/trainer-documents/${docId}/approve`, {
    method: 'POST',
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<AdminDocReviewResponse>;
}

export async function replyToTicket(
  ticketId: string,
  payload: { sendTo: string; subject: string; body: string },
): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/admin/support-tickets/${ticketId}/reply`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
}

export async function rejectTrainerDocument(
  docId: string,
  rejectionReason?: string | null,
): Promise<AdminDocReviewResponse> {
  const res = await authFetch(`${BASE_URL}/api/admin/trainer-documents/${docId}/reject`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ rejectionReason: rejectionReason ?? null }),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<AdminDocReviewResponse>;
}
