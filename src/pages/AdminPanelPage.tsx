import { useEffect, useMemo, useState } from 'react';
import AppHeader from '../components/ui/AppHeader';
import Icon from '../components/ui/Icon';
import KanbanColumn from '../components/admin/KanbanColumn';
import TicketDetail from '../components/admin/TicketDetail';
import FilterGroup from '../components/admin/FilterGroup';
import Toast from '../components/admin/Toast';
import { COLUMNS, card } from '../components/admin/styles';
import { useAdminTickets } from '../hooks/useAdminTickets';
import { statusKeyToInt, statusIntToKey } from '../services/adminService';
import type { AdminTicketDetail, AdminTicketKanbanStatus } from '../types';

export default function AdminPanelPage() {
  const a = useAdminTickets();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminTicketDetail | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverOver, setHoverOver] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    a.loadDetail(selectedId).then((d) => {
      if (!cancelled) setDetail(d);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId, a]);

  const byColumn = useMemo(() => {
    const acc: Record<AdminTicketKanbanStatus, typeof a.tickets> = {
      open: [], in_progress: [], resolved: [], closed: [],
    };
    a.tickets.forEach((t) => {
      acc[statusIntToKey(t.status)].push(t);
    });
    return acc;
  }, [a.tickets]);

  const handleDrop = async (id: string, statusKey: AdminTicketKanbanStatus) => {
    const target = a.tickets.find((t) => t.id === id);
    if (!target) return;
    const newStatus = statusKeyToInt(statusKey);
    if (target.status === newStatus) return;
    await a.moveTicket(id, newStatus);
    const col = COLUMNS.find((c) => c.id === statusKey);
    if (col) setToast(`Тікет переміщено в ${col.label}`);
  };

  const handleStatusFromDetail = async (newStatus: number) => {
    if (!detail) return;
    const updated = await a.setStatusFromDetail(detail.id, newStatus);
    if (updated) {
      setDetail(updated);
      const col = COLUMNS.find((c) => c.id === statusIntToKey(newStatus));
      if (col) setToast(`Тікет переміщено в ${col.label}`);
    }
  };

  const handleAssign = async (adminId: string | null) => {
    if (!detail) return;
    const updated = await a.reassign(detail.id, adminId);
    if (updated) setDetail(updated);
  };

  const handleApprove = async () => {
    if (!detail?.document) return;
    const res = await a.approveDoc(detail.document.id);
    if (res) {
      setToast('Документ верифіковано');
      setSelectedId(null);
    }
  };

  const handleReply = async (payload: { sendTo: string; subject: string; body: string }) => {
    if (!detail) return false;
    const ok = await a.sendReply(detail.id, payload);
    if (ok) setToast('Відповідь надіслано');
    return ok;
  };

  const handleReject = async (reason: string | null) => {
    if (!detail?.document) return;
    const res = await a.rejectDoc(detail.document.id, reason);
    if (res) {
      setToast('Документ відхилено');
      setSelectedId(null);
    }
  };

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh' }}>
      <AppHeader />

      <main style={{ maxWidth: 1480, margin: '0 auto', padding: '28px 28px 64px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '3px 11px 3px 9px',
                borderRadius: 999,
                background: '#0F172A',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              <Icon d="M12 1l3 6 6 1-4.5 4 1 6.5L12 16l-5.5 2.5 1-6.5L3 8l6-1z" size={11} stroke={2} />
              Адмін
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: '-0.025em',
                fontFamily: 'var(--display, "Plus Jakarta Sans")',
              }}
            >
              Звернення підтримки
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 14.5, color: '#6B7280' }}>
              <strong style={{ color: '#0F172A' }}>{a.stats?.openTickets ?? 0}</strong> нових ·{' '}
              <strong style={{ color: '#0F172A' }}>{a.stats?.pendingDocuments ?? 0}</strong> документів очікують ·{' '}
              <strong style={{ color: '#DC2626' }}>{a.stats?.unassignedTickets ?? 0}</strong> без відповідального
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ ...card, padding: 14, marginBottom: 22, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 240 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
              <Icon d="M11 4a7 7 0 100 14 7 7 0 000-14z M20 20l-3.5-3.5" size={14} />
            </span>
            <input
              value={a.search}
              onChange={(e) => a.setSearch(e.target.value)}
              placeholder="Пошук за ID, темою, автором, бронюванням…"
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: 9,
                border: '1px solid #E7E9EE',
                background: 'white',
                fontSize: 13.5,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <FilterGroup
            value={a.typeFilter}
            onChange={a.setTypeFilter}
            options={[
              { id: 'all', label: 'Усі' },
              { id: 'request', label: 'Звернення' },
              { id: 'document', label: 'Документи' },
            ]}
          />

          <select
            value={a.assigneeFilter}
            onChange={(e) => a.setAssigneeFilter(e.target.value)}
            style={{
              padding: '8px 30px 8px 12px',
              border: '1px solid #E7E9EE',
              borderRadius: 9,
              fontSize: 13,
              fontFamily: 'inherit',
              background: 'white',
              color: '#0F172A',
              cursor: 'pointer',
            }}
          >
            <option value="all">Усі відповідальні</option>
            <option value="unassigned">Не призначено</option>
            {a.admins.map((adm) => (
              <option key={adm.id} value={adm.id}>{adm.fullName}</option>
            ))}
          </select>
        </div>

        {/* Kanban */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, alignItems: 'stretch' }}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              col={col}
              tickets={byColumn[col.id]}
              draggingId={draggingId}
              hoverOver={hoverOver}
              setHoverOver={setHoverOver}
              onDropTicket={handleDrop}
              onOpen={(id) => setSelectedId(id)}
              onDragStart={(id) => setDraggingId(id)}
              onDragEnd={() => { setDraggingId(null); setHoverOver(null); }}
            />
          ))}
        </div>

        <p style={{ margin: '18px 0 0', fontSize: 12.5, color: '#9CA3AF', textAlign: 'center' }}>
          💡 Перетягніть тікет між колонками, щоб змінити статус. Клік — деталі.
        </p>

        {a.isLoading && a.tickets.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: 24, color: '#6B7280' }}>Завантаження…</p>
        )}
      </main>

      {selectedId && detail && (
        <TicketDetail
          ticket={detail}
          admins={a.admins}
          busy={a.busyId === detail.id}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusFromDetail}
          onApproveDoc={handleApprove}
          onRejectDoc={handleReject}
          onAssign={handleAssign}
          onReply={handleReply}
        />
      )}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      {a.error && <Toast msg={a.error} tone="error" onClose={a.clearError} />}
    </div>
  );
}
