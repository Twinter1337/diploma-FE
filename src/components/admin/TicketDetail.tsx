import { useEffect, useState } from 'react';
import Icon from '../ui/Icon';
import Avatar from './Avatar';
import StatusPill from './StatusPill';
import DocTypeBadge from './DocTypeBadge';
import DocumentPreview from './DocumentPreview';
import { btnGhost, btnPrimary, COLUMNS } from './styles';
import { statusKeyToInt, statusIntToKey } from '../../services/adminService';
import type { AdminAssignee, AdminTicketDetail, AdminTicketKanbanStatus } from '../../types';

interface Props {
  ticket: AdminTicketDetail;
  admins: AdminAssignee[];
  busy: boolean;
  onClose: () => void;
  onStatusChange: (newStatus: number) => void;
  onApproveDoc: () => void;
  onRejectDoc: (reason: string | null) => void;
  onAssign: (adminId: string | null) => void;
  onReply: (payload: { sendTo: string; subject: string; body: string }) => Promise<boolean>;
}

function MetaBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#6B7280',
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

const ROLE_RU: Record<string, string> = { Client: 'Клієнт', Trainer: 'Тренер', Admin: 'Адмін' };

export default function TicketDetail({
  ticket,
  admins,
  busy,
  onClose,
  onStatusChange,
  onApproveDoc,
  onRejectDoc,
  onAssign,
  onReply,
}: Props) {
  const isDoc = ticket.type === 'document';
  const [assignOpen, setAssignOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (rejectOpen) setRejectOpen(false);
        else if (replyOpen) setReplyOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, rejectOpen, replyOpen]);

  const openReply = () => {
    setReplySubject(ticket.subject ? `Re: ${ticket.subject}`.slice(0, 255) : '');
    setReplyBody('');
    setReplyError(null);
    setReplyOpen(true);
  };

  const submitReply = async () => {
    const sendTo = ticket.createdBy.email?.trim() ?? '';
    const subject = replySubject.trim();
    const body = replyBody.trim();
    if (!sendTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sendTo)) {
      setReplyError('Невалідна email-адреса отримувача');
      return;
    }
    if (!subject) {
      setReplyError('Введіть тему листа');
      return;
    }
    if (!body) {
      setReplyError('Введіть текст листа');
      return;
    }
    setReplyError(null);
    const ok = await onReply({ sendTo, subject, body });
    if (ok) setReplyOpen(false);
  };

  const handleReject = () => {
    setRejectReason('');
    setRejectOpen(true);
  };

  const confirmReject = () => {
    const trimmed = rejectReason.trim();
    onRejectDoc(trimmed ? trimmed.slice(0, 500) : null);
    setRejectOpen(false);
  };

  const canReviewDoc = isDoc && ticket.document && ticket.document.status === 0;
  const statusKey = statusIntToKey(ticket.status);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 100%)',
          height: '100%',
          background: 'white',
          boxShadow: '-20px 0 40px -20px rgba(15,23,42,0.3)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'adminSlideIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 26px 18px',
            borderBottom: '1px solid #EDEFF3',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span
                title={ticket.id}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#6B7280',
                  letterSpacing: '0.02em',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  padding: '3px 9px',
                  background: '#F1F2F4',
                  borderRadius: 6,
                  wordBreak: 'break-all',
                  maxWidth: 320,
                }}
              >
                {ticket.id}
              </span>
              <StatusPill status={ticket.status} />
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon d="M6 6l12 12 M18 6L6 18" size={18} />
            </button>
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.025em',
              fontFamily: 'var(--display, "Plus Jakarta Sans")',
              lineHeight: 1.25,
            }}
          >
            {ticket.subject}
          </h2>
          {isDoc && ticket.document && <div><DocTypeBadge type={ticket.document.type} /></div>}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 26px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              background: '#FAFBFC',
              borderRadius: 12,
              padding: 16,
              marginBottom: 18,
              border: '1px solid #EDEFF3',
            }}
          >
            <MetaBlock label="Створив">
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Avatar name={ticket.createdBy.fullName} avatarUrl={ticket.createdBy.avatarUrl} size={28} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                    {ticket.createdBy.fullName}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
                    {ROLE_RU[ticket.createdBy.role] ?? ticket.createdBy.role}
                  </div>
                </div>
              </div>
              {ticket.createdBy.email && (
                <a
                  href={`mailto:${ticket.createdBy.email}`}
                  title={ticket.createdBy.email}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 8,
                    fontSize: 12.5,
                    color: 'var(--accent-700, #1D4ED8)',
                    fontWeight: 500,
                    textDecoration: 'none',
                    minWidth: 0,
                    maxWidth: '100%',
                  }}
                >
                  <Icon
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6"
                    size={12}
                  />
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}
                  >
                    {ticket.createdBy.email}
                  </span>
                </a>
              )}
              <div
                style={{
                  fontSize: 11,
                  color: '#9CA3AF',
                  marginTop: 6,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  wordBreak: 'break-all',
                }}
                title={ticket.createdBy.id}
              >
                ID: {ticket.createdBy.id}
              </div>
            </MetaBlock>

            <MetaBlock label="Призначено">
              <div style={{ position: 'relative' }}>
                {ticket.assignedTo ? (
                  <button
                    onClick={() => setAssignOpen((v) => !v)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                    }}
                  >
                    <Avatar name={ticket.assignedTo.fullName} avatarUrl={ticket.assignedTo.avatarUrl} size={28} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                        {ticket.assignedTo.fullName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--accent-700, #1D4ED8)', marginTop: 1 }}>
                        Перепризначити →
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => setAssignOpen((v) => !v)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 10px 4px 6px',
                      background: 'white',
                      border: '1px dashed #CBD5E1',
                      borderRadius: 999,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 12.5,
                      color: '#6B7280',
                      fontWeight: 500,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#F1F5F9',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94A3B8',
                      }}
                    >
                      <Icon d="M12 5v14 M5 12h14" size={10} stroke={2.4} />
                    </span>
                    Призначити
                  </button>
                )}
                {assignOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      zIndex: 5,
                      background: 'white',
                      border: '1px solid #E7E9EE',
                      borderRadius: 10,
                      boxShadow: '0 12px 32px -8px rgba(15,23,42,0.2)',
                      minWidth: 220,
                      padding: 6,
                    }}
                  >
                    {admins.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setAssignOpen(false);
                          onAssign(a.id);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '7px 8px',
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: 7,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: 13,
                          color: '#0F172A',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#F4F5F8')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                      >
                        <Avatar name={a.fullName} avatarUrl={a.avatarUrl} size={22} />
                        {a.fullName}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setAssignOpen(false);
                        onAssign(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '7px 8px',
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 7,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 13,
                        color: '#6B7280',
                        textAlign: 'left',
                        borderTop: '1px solid #EDEFF3',
                        marginTop: 4,
                      }}
                    >
                      Зняти призначення
                    </button>
                  </div>
                )}
              </div>
            </MetaBlock>

            <MetaBlock label="Створено">
              <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 500 }}>
                {new Date(ticket.createdAt).toLocaleString('uk-UA')}
              </span>
            </MetaBlock>

            {!isDoc && (
              <MetaBlock label="Бронювання">
                {ticket.relatedBookingId ? (
                  <span
                    title={ticket.relatedBookingId}
                    style={{
                      fontSize: 11.5,
                      color: 'var(--accent-700, #1D4ED8)',
                      fontWeight: 600,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      wordBreak: 'break-all',
                      display: 'inline-block',
                    }}
                  >
                    {ticket.relatedBookingId}
                  </span>
                ) : (
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>—</span>
                )}
              </MetaBlock>
            )}

            {isDoc && (
              <MetaBlock label="ID тренера">
                {ticket.relatedTrainerId ? (
                  <span
                    title={ticket.relatedTrainerId}
                    style={{
                      fontSize: 11.5,
                      color: 'var(--accent-700, #1D4ED8)',
                      fontWeight: 600,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      wordBreak: 'break-all',
                      display: 'inline-block',
                    }}
                  >
                    {ticket.relatedTrainerId}
                  </span>
                ) : (
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>—</span>
                )}
              </MetaBlock>
            )}
          </div>

          {isDoc && ticket.document ? (
            <DocumentPreview
              doc={ticket.document}
              busy={busy}
              canReview={!!canReviewDoc}
              onApprove={onApproveDoc}
              onReject={handleReject}
            />
          ) : (
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#6B7280',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Текст звернення
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: '#0F172A',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {ticket.description || '—'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 26px',
            borderTop: '1px solid #EDEFF3',
            background: '#FAFBFC',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Статус:</span>
            <select
              value={statusKey}
              disabled={busy}
              onChange={(e) => onStatusChange(statusKeyToInt(e.target.value as AdminTicketKanbanStatus))}
              style={{
                padding: '7px 30px 7px 11px',
                border: '1px solid #D9DCE2',
                borderRadius: 8,
                fontSize: 13,
                fontFamily: 'inherit',
                background: 'white',
                color: '#0F172A',
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.6 : 1,
              }}
            >
              {COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          {!isDoc && (
            <div style={{ display: 'inline-flex', gap: 8 }}>
              <button
                onClick={openReply}
                disabled={busy || !ticket.createdBy.email}
                title={!ticket.createdBy.email ? 'Email автора відсутній' : undefined}
                style={{ ...btnGhost, opacity: busy || !ticket.createdBy.email ? 0.6 : 1, cursor: busy || !ticket.createdBy.email ? 'not-allowed' : 'pointer' }}
              >
                Написати відповідь
              </button>
              <button
                onClick={() => onStatusChange(3)}
                disabled={busy || ticket.status === 3}
                style={{ ...btnPrimary, opacity: busy || ticket.status === 3 ? 0.6 : 1 }}
              >
                Закрити тікет
              </button>
            </div>
          )}
        </div>
      </aside>

      {rejectOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setRejectOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: 'rgba(15,23,42,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'adminFadeIn 160ms ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(480px, 100%)',
              background: 'white',
              borderRadius: 16,
              boxShadow: '0 30px 60px -20px rgba(15,23,42,0.4)',
              overflow: 'hidden',
              animation: 'adminPopIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ padding: '22px 24px 8px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#FEF2F2',
                  color: '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon d="M12 9v4 M12 17h.01 M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#0F172A',
                    fontFamily: 'var(--display, "Plus Jakarta Sans")',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Відхилити документ
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#6B7280', lineHeight: 1.5 }}>
                  Вкажіть причину відхилення. Тренер побачить її у своєму кабінеті.
                </p>
              </div>
            </div>

            <div style={{ padding: '14px 24px 4px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#6B7280',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Причина (до 500 символів)
              </label>
              <textarea
                autoFocus
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value.slice(0, 500))}
                placeholder="Наприклад: документ нечіткий, неможливо прочитати..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  border: '1px solid #D9DCE2',
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  color: '#0F172A',
                  resize: 'vertical',
                  outline: 'none',
                  lineHeight: 1.55,
                  boxSizing: 'border-box',
                  transition: 'border-color 120ms, box-shadow 120ms',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#DC2626';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#D9DCE2';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <div style={{ marginTop: 6, fontSize: 11.5, color: '#9CA3AF', textAlign: 'right' }}>
                {rejectReason.length}/500
              </div>
            </div>

            <div
              style={{
                padding: '14px 24px 20px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                onClick={() => setRejectOpen(false)}
                style={{
                  padding: '10px 18px',
                  border: '1px solid #D9DCE2',
                  background: 'white',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: '#0F172A',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                Скасувати
              </button>
              <button
                onClick={confirmReject}
                disabled={busy}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  background: 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: 'white',
                  fontFamily: 'inherit',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  opacity: busy ? 0.6 : 1,
                  boxShadow: '0 6px 14px -4px rgba(220,38,38,0.5)',
                }}
              >
                Відхилити
              </button>
            </div>
          </div>
        </div>
      )}

      {replyOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setReplyOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: 'rgba(15,23,42,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'adminFadeIn 160ms ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(560px, 100%)',
              background: 'white',
              borderRadius: 16,
              boxShadow: '0 30px 60px -20px rgba(15,23,42,0.4)',
              overflow: 'hidden',
              animation: 'adminPopIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ padding: '22px 24px 8px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#EEF2FF',
                  color: 'var(--accent-700, #1D4ED8)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6"
                  size={20}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#0F172A',
                    fontFamily: 'var(--display, "Plus Jakarta Sans")',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Написати відповідь
                </h3>
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: 13.5,
                    color: '#6B7280',
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Кому: <strong style={{ color: '#0F172A' }}>{ticket.createdBy.email}</strong>
                </p>
              </div>
            </div>

            <div style={{ padding: '14px 24px 4px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#6B7280',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Тема (до 255 символів)
              </label>
              <input
                autoFocus
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value.slice(0, 255))}
                placeholder="Re: ..."
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  border: '1px solid #D9DCE2',
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  color: '#0F172A',
                  background: 'white',
                  outline: 'none',
                  boxSizing: 'border-box',
                  colorScheme: 'light',
                }}
              />
            </div>

            <div style={{ padding: '12px 24px 4px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#6B7280',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Текст листа
              </label>
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Доброго дня,..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  border: '1px solid #D9DCE2',
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  color: '#0F172A',
                  background: 'white',
                  resize: 'vertical',
                  outline: 'none',
                  lineHeight: 1.55,
                  boxSizing: 'border-box',
                  colorScheme: 'light',
                }}
              />
              {replyError && (
                <div style={{ marginTop: 8, fontSize: 12.5, color: '#DC2626' }}>{replyError}</div>
              )}
            </div>

            <div
              style={{
                padding: '14px 24px 20px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                onClick={() => setReplyOpen(false)}
                style={{
                  padding: '10px 18px',
                  border: '1px solid #D9DCE2',
                  background: 'white',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: '#0F172A',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                Скасувати
              </button>
              <button
                onClick={submitReply}
                disabled={busy}
                style={{
                  padding: '10px 18px',
                  border: 'none',
                  background: 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: 'white',
                  fontFamily: 'inherit',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  opacity: busy ? 0.6 : 1,
                  boxShadow: '0 6px 14px -4px rgba(29,78,216,0.5)',
                }}
              >
                {busy ? 'Надсилання…' : 'Надіслати'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
