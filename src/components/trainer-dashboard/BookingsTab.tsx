import { useState } from 'react';
import type { TrainerBooking } from '../../types';
import { BookingStatus, SlotFormat } from '../../types';
import DashAvatar from './DashAvatar';
import DisputeModal from '../dispute/DisputeModal';
import { useIsMobile } from '../../hooks/useWindowWidth';

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #E7E9EE', borderRadius: 14,
};

type BookingGroup = { dateLabel: string; items: TrainerBooking[] };

function groupByDate(bookings: TrainerBooking[]): BookingGroup[] {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);
  const map: Record<string, TrainerBooking[]> = {};

  for (const b of bookings) {
    const d = new Date(b.startDateTime); d.setHours(0, 0, 0, 0);
    let label: string;
    if (d.getTime() === today.getTime()) {
      label = 'Сьогодні · ' + d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
    } else if (d.getTime() === tomorrow.getTime()) {
      label = 'Завтра · ' + d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
    } else {
      label = d.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    (map[label] ??= []).push(b);
  }
  return Object.entries(map).map(([dateLabel, items]) => ({ dateLabel, items }));
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg: Record<number, { bg: string; color: string; dot: string; label: string }> = {
    [BookingStatus.Pending]:   { bg: '#FFFBEB', color: '#B45309', dot: '#F59E0B', label: 'Очікує оплати' },
    [BookingStatus.Confirmed]: { bg: '#ECFDF5', color: '#047857', dot: '#10B981', label: 'Підтверджено' },
    [BookingStatus.Completed]: { bg: '#F0F9FF', color: '#0369A1', dot: '#38BDF8', label: 'Завершено' },
    [BookingStatus.Cancelled]: { bg: '#FEF2F2', color: '#B91C1C', dot: '#F87171', label: 'Скасовано' },
  };
  const c = cfg[status] ?? cfg[BookingStatus.Pending];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 11px 4px 9px', fontSize: 12, fontWeight: 600,
      borderRadius: 999, background: c.bg, color: c.color, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {c.label}
    </span>
  );
}

interface Props {
  bookings: TrainerBooking[];
  isLoading: boolean;
  error: string | null;
}

export default function BookingsTab({ bookings, isLoading, error }: Props) {
  const [disputeFor, setDisputeFor] = useState<TrainerBooking | null>(null);
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ ...card, height: 84, background: '#F8F9FB' }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...card, padding: '32px 24px', textAlign: 'center', color: '#DC2626', fontSize: 14 }}>
        {error}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div style={{ ...card, padding: '60px 24px', textAlign: 'center', border: '1px dashed #D9DCE2' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>Немає активних бронювань</div>
        <div style={{ fontSize: 13.5, color: '#6B7280' }}>Бронювання від клієнтів з'являться тут</div>
      </div>
    );
  }

  const groups = groupByDate(bookings);
  const total = bookings.length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13.5, color: '#6B7280' }}>
          <strong style={{ color: '#0F172A' }}>{total}</strong> активних бронювань
        </p>
      </div>

      {disputeFor && (
        <DisputeModal
          bookingId={disputeFor.id}
          contextLabel={`Клієнт: ${disputeFor.clientFullName} · ${new Date(disputeFor.startDateTime).toLocaleString('uk-UA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`}
          onClose={() => setDisputeFor(null)}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {groups.map(group => (
          <div key={group.dateLabel}>
            <h3 style={{
              margin: '0 0 10px', fontSize: 12.5, fontWeight: 700,
              color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              {group.dateLabel}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {group.items.map(b => {
                const time = new Date(b.startDateTime).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
                return (
                  <article key={b.id} style={{
                    ...card, padding: 16,
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'auto 1fr auto' : 'auto 1fr auto auto',
                    gap: isMobile ? 12 : 16, alignItems: 'center',
                  }}>
                    <DashAvatar name={b.clientFullName} size={48} avatarUrl={b.clientAvatarUrl} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.clientFullName}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12.5, color: '#6B7280', flexWrap: 'wrap' }}>
                        <span>{time} · {b.durationInMinutes} хв</span>
                        <span>{b.format === SlotFormat.Online ? 'Онлайн' : 'Офлайн'}</span>
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                    {!isMobile && b.status !== BookingStatus.Pending && (
                      <button
                        onClick={() => setDisputeFor(b)}
                        style={{
                          padding: '7px 12px', background: 'white', color: '#3F4651',
                          border: '1.5px solid #E7E9EE', borderRadius: 9,
                          fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Відкрити спір
                      </button>
                    )}
                    {isMobile && b.status !== BookingStatus.Pending && (
                      <button
                        onClick={() => setDisputeFor(b)}
                        style={{
                          gridColumn: '1 / -1',
                          padding: '8px 12px', background: 'white', color: '#3F4651',
                          border: '1.5px solid #E7E9EE', borderRadius: 9,
                          fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                          marginTop: 4,
                        }}
                      >
                        Відкрити спір
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
