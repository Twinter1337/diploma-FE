import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  approveTrainerDocument,
  getAdminStats,
  getAdminTicket,
  listAdminTickets,
  listAdminUsers,
  patchAdminTicket,
  rejectTrainerDocument,
  replyToTicket,
} from '../services/adminService';
import { useAuthContext } from '../contexts/AuthContext';
import type {
  AdminAssignee,
  AdminStats,
  AdminTicketDetail,
  AdminTicketListItem,
} from '../types';

export type TypeFilter = 'all' | 'request' | 'document';
export type AssigneeFilter = 'all' | 'unassigned' | string; // string = admin UUID

export function useAdminTickets() {
  const { isAuthenticated } = useAuthContext();

  const [tickets, setTickets] = useState<AdminTicketListItem[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [admins, setAdmins] = useState<AdminAssignee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>('all');

  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const [list, s] = await Promise.all([
        listAdminTickets({
          type: typeFilter,
          assignedTo: assigneeFilter === 'all' ? undefined : assigneeFilter,
          search: debouncedSearch || undefined,
          pageSize: 100,
        }),
        getAdminStats(),
      ]);
      setTickets(list.items);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка завантаження');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, typeFilter, assigneeFilter, debouncedSearch]);

  const adminsFetched = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || adminsFetched.current) return;
    adminsFetched.current = true;
    listAdminUsers().then(setAdmins).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await getAdminStats());
    } catch {
      /* ignore */
    }
  }, []);

  const moveTicket = useCallback(
    async (id: string, newStatus: number) => {
      const target = tickets.find((t) => t.id === id);
      if (!target || target.status === newStatus) return;

      const prev = tickets;
      setTickets((cur) => cur.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
      setBusyId(id);
      try {
        await patchAdminTicket(id, { status: newStatus });
        refreshStats();
      } catch (e) {
        setTickets(prev);
        setError(e instanceof Error ? e.message : 'Не вдалось оновити статус');
      } finally {
        setBusyId(null);
      }
    },
    [tickets, refreshStats],
  );

  const reassign = useCallback(
    async (id: string, adminId: string | null): Promise<AdminTicketDetail | null> => {
      setBusyId(id);
      try {
        const updated = await patchAdminTicket(
          id,
          adminId ? { assignedTo: adminId } : { unassign: true },
        );
        setTickets((cur) =>
          cur.map((t) => (t.id === id ? { ...t, assignedTo: updated.assignedTo } : t)),
        );
        refreshStats();
        return updated;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не вдалось перепризначити');
        return null;
      } finally {
        setBusyId(null);
      }
    },
    [refreshStats],
  );

  const setStatusFromDetail = useCallback(
    async (id: string, newStatus: number): Promise<AdminTicketDetail | null> => {
      setBusyId(id);
      try {
        const updated = await patchAdminTicket(id, { status: newStatus });
        setTickets((cur) => cur.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
        refreshStats();
        return updated;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не вдалось оновити статус');
        return null;
      } finally {
        setBusyId(null);
      }
    },
    [refreshStats],
  );

  const approveDoc = useCallback(
    async (docId: string) => {
      setBusyId(docId);
      try {
        const res = await approveTrainerDocument(docId);
        await fetchAll();
        return res;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не вдалось верифікувати документ');
        return null;
      } finally {
        setBusyId(null);
      }
    },
    [fetchAll],
  );

  const rejectDoc = useCallback(
    async (docId: string, reason: string | null) => {
      setBusyId(docId);
      try {
        const res = await rejectTrainerDocument(docId, reason);
        await fetchAll();
        return res;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не вдалось відхилити документ');
        return null;
      } finally {
        setBusyId(null);
      }
    },
    [fetchAll],
  );

  const sendReply = useCallback(
    async (ticketId: string, payload: { sendTo: string; subject: string; body: string }): Promise<boolean> => {
      setBusyId(ticketId);
      try {
        await replyToTicket(ticketId, payload);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не вдалось надіслати відповідь');
        return false;
      } finally {
        setBusyId(null);
      }
    },
    [],
  );

  const loadDetail = useCallback(
    async (id: string): Promise<AdminTicketDetail | null> => {
      try {
        return await getAdminTicket(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не вдалось завантажити деталі');
        return null;
      }
    },
    [],
  );

  const api = useMemo(
    () => ({
      tickets,
      stats,
      admins,
      isLoading,
      error,
      busyId,
      search,
      setSearch,
      typeFilter,
      setTypeFilter,
      assigneeFilter,
      setAssigneeFilter,
      refetch: fetchAll,
      moveTicket,
      reassign,
      setStatusFromDetail,
      approveDoc,
      rejectDoc,
      sendReply,
      loadDetail,
      clearError: () => setError(null),
    }),
    [
      tickets, stats, admins, isLoading, error, busyId,
      search, typeFilter, assigneeFilter,
      fetchAll, moveTicket, reassign, setStatusFromDetail, approveDoc, rejectDoc, sendReply, loadDetail,
    ],
  );

  return api;
}
