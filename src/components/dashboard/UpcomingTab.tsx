import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ClientBooking } from '../../types';
import { BookingStatus, SlotFormat } from '../../types';
import { usePaymentCountdown } from '../../hooks/usePaymentCountdown';
import DisputeModal from '../dispute/DisputeModal';

function nameHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % 360;
  return h;
}

function formatDateTimeUk(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
  const time = d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}

function formatCountdown(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'зараз';
  const totalMin = Math.floor(diff / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0 && hours > 0) return `через ${days} д. ${hours} год.`;
  if (days > 0) return `через ${days} д.`;
  if (hours > 0 && mins > 0) return `через ${hours} год. ${mins} хв.`;
  if (hours > 0) return `через ${hours} год.`;
  return `через ${mins} хв.`;
}

function refundPercent(iso: string): number {
  const diffHours = (new Date(iso).getTime() - Date.now()) / 3600000;
  return diffHours > 24 ? 100 : 50;
}

function StatusBadge({ status, suffix, expired }: { status: BookingStatus; suffix?: string; expired?: boolean }) {
  const cfg: Record<number, { bg: string; color: string; dot: string; label: string }> = {
    [BookingStatus.Confirmed]: { bg: '#ECFDF5', color: '#047857', dot: '#10B981', label: 'Підтверджено' },
    [BookingStatus.Pending]: { bg: '#FFFBEB', color: '#B45309', dot: '#F59E0B', label: 'Очікує оплати' },
    [BookingStatus.Cancelled]: { bg: '#FEF2F2', color: '#B91C1C', dot: '#EF4444', label: 'Скасовано' },
    [BookingStatus.Completed]: { bg: '#F0FDF4', color: '#15803D', dot: '#22C55E', label: 'Завершено' },
  };
  const base = cfg[status] ?? cfg[BookingStatus.Pending];
  const c = expired
    ? { ...base, bg: '#FEF2F2', color: '#B91C1C', dot: '#EF4444' }
    : base;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px 3px 9px', fontSize: 11.5, fontWeight: 600,
      borderRadius: 999, background: c.bg, color: c.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {c.label}
      {suffix && (
        <>
          <span style={{ opacity: 0.4, fontWeight: 400 }}>|</span>
          {suffix}
        </>
      )}
    </span>
  );
}

function TrainerAvatar({ name, size, avatarUrl }: { name: string; size: number; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  const hue = nameHue(name);
  const initials = name.split(' ').slice(0, 2).map(p => p[0]).join('');
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},70%,55%) 0%, hsl(${(hue + 40) % 360},65%,70%) 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: size * 0.3, fontWeight: 700,
    }}>
      {initials}
    </div>
  );
}

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #E7E9EE', borderRadius: 14, padding: 18,
};
const btnGhost: React.CSSProperties = {
  padding: '9px 16px', background: 'white', color: '#3F4651',
  border: '1.5px solid #E7E9EE', borderRadius: 9,
  fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};
const btnDanger: React.CSSProperties = {
  padding: '9px 16px', background: 'white', color: '#DC2626',
  border: '1.5px solid #FECACA', borderRadius: 9,
  fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};
const btnDangerFilled: React.CSSProperties = {
  padding: '9px 16px', background: '#DC2626', color: 'white',
  border: 'none', borderRadius: 9,
  fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};
const btnPrimary: React.CSSProperties = {
  padding: '9px 16px', background: 'var(--accent-600)', color: 'white',
  border: 'none', borderRadius: 9,
  fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};

function CalendarIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x={3} y={4} width={18} height={18} rx={2} />
      <line x1={16} y1={2} x2={16} y2={6} />
      <line x1={8} y1={2} x2={8} y2={6} />
      <line x1={3} y1={10} x2={21} y2={10} />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={9} />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

function LocationIcon({ online }: { online: boolean }) {
  if (online) {
    return (
      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x={2} y={3} width={20} height={14} rx={2} />
        <line x1={8} y1={21} x2={16} y2={21} />
        <line x1={12} y1={17} x2={12} y2={21} />
      </svg>
    );
  }
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-7.5-7-13a7 7 0 1114 0c0 5.5-7 13-7 13z" />
      <circle cx={12} cy={10} r={2} />
    </svg>
  );
}

interface LateFeeCheckout {
  bookingId: string;
  checkoutUrl: string;
  totalAmount: number;
}

interface Props {
  bookings: ClientBooking[];
  isLoading: boolean;
  error: string | null;
  cancellingId: string | null;
  retryingPaymentId: string | null;
  lateFeeCheckout: LateFeeCheckout | null;
  onCancelBooking: (bookingId: string) => Promise<boolean>;
  onRetryPayment: (bookingId: string) => Promise<void>;
  onConfirmLateFee: () => void;
  onDismissLateFee: () => void;
}

interface CardProps {
  b: ClientBooking;
  idx: number;
  cancellingId: string | null;
  retryingPaymentId: string | null;
  lateFeeCheckout: LateFeeCheckout | null;
  onCancelBooking: (id: string) => Promise<boolean>;
  onRetryPayment: (id: string) => Promise<void>;
  onConfirmLateFee: () => void;
  onDismissLateFee: () => void;
}

function BookingCard({ b, idx, cancellingId, retryingPaymentId, lateFeeCheckout, onCancelBooking, onRetryPayment, onConfirmLateFee, onDismissLateFee }: CardProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isShowingDetails, setIsShowingDetails] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const { label: countdownLabel, expired: paymentExpired } = usePaymentCountdown(b.createdAt);

  const { date, time } = formatDateTimeUk(b.startTime);
  const countdown = formatCountdown(b.startTime);
  const isCancelling = cancellingId === b.id;
  const isRetrying = retryingPaymentId === b.id;
  const isShowingLateFeeWarning = lateFeeCheckout?.bookingId === b.id;
  const pct = refundPercent(b.startTime);
  const hasDetails = (b as unknown as Record<string, unknown>).description
    || (b as unknown as Record<string, unknown>).gymName
    || (b as unknown as Record<string, unknown>).gymAddress;
  const bx = b as ClientBooking & { description?: string; gymName?: string; gymAddress?: string };

  return (
    <article key={b.id ?? idx} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'center' }}>
        <TrainerAvatar name={b.trainerFullName} size={62} avatarUrl={b.trainerAvatarUrl} />

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em' }}>
              {b.trainerFullName}
            </h3>
            <StatusBadge
              status={b.status}
              suffix={b.status === BookingStatus.Pending ? countdownLabel : undefined}
              expired={b.status === BookingStatus.Pending && paymentExpired}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: '#6B7280' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CalendarIcon />
              <strong style={{ color: '#0F172A', fontWeight: 600 }}>{date}, {time}</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ClockIcon />
              {b.durationMinutes} хв
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <LocationIcon online={b.format === SlotFormat.Online} />
              {b.format === SlotFormat.Online ? 'Онлайн' : 'Офлайн'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-700)', fontWeight: 600 }}>
              <ClockIcon />
              {countdown}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          {hasDetails && (
            <button
              onClick={() => setIsShowingDetails(v => !v)}
              style={{ ...btnGhost, padding: '9px 16px' }}
            >
              {isShowingDetails ? 'Сховати' : 'Деталі'}
            </button>
          )}
          {b.status === BookingStatus.Pending && !paymentExpired && (
            <button
              onClick={() => onRetryPayment(b.id)}
              disabled={isRetrying}
              style={{ ...btnPrimary, opacity: isRetrying ? 0.6 : 1 }}
            >
              {isRetrying ? 'Переадресація…' : 'Оплатити'}
            </button>
          )}
          {b.status !== BookingStatus.Cancelled && !isConfirming && (
            <button
              onClick={() => setIsConfirming(true)}
              disabled={isCancelling}
              style={{ ...btnDanger, opacity: isCancelling ? 0.5 : 1 }}
            >
              Скасувати
            </button>
          )}
          {b.status !== BookingStatus.Pending && (
            <button onClick={() => setIsDisputeOpen(true)} style={btnGhost}>
              Відкрити спір
            </button>
          )}
        </div>
      </div>

      {isDisputeOpen && (
        <DisputeModal
          bookingId={b.id}
          contextLabel={`Тренер: ${b.trainerFullName} · ${date}, ${time}`}
          onClose={() => setIsDisputeOpen(false)}
        />
      )}

      {isShowingDetails && hasDetails && (
        <div style={{
          marginTop: 14, padding: '14px 16px',
          background: '#F8F9FB', border: '1px solid #E7E9EE', borderRadius: 10,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {bx.description && (
            <div style={{ fontSize: 13.5, color: '#374151' }}>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Опис:&nbsp;</span>
              {bx.description}
            </div>
          )}
          {bx.gymName && (
            <div style={{ fontSize: 13.5, color: '#374151' }}>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Зал:&nbsp;</span>
              {bx.gymName}
            </div>
          )}
          {bx.gymAddress && (
            <div style={{ fontSize: 13.5, color: '#374151' }}>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Адреса:&nbsp;</span>
              {bx.gymAddress}
            </div>
          )}
        </div>
      )}

      {isConfirming && (
        <div style={{
          marginTop: 14, padding: '14px 16px',
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 13.5, color: '#7F1D1D' }}>
            <strong>Скасувати заняття?</strong>
            {' '}
            Повернення {pct === 100
              ? 'складе 100% вартості.'
              : 'складе 50% — заняття менш ніж за 24 год.'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => setIsConfirming(false)} style={btnGhost}>Назад</button>
            <button
              onClick={async () => {
                setIsConfirming(false);
                await onCancelBooking(b.id);
              }}
              disabled={isCancelling}
              style={{ ...btnDangerFilled, opacity: isCancelling ? 0.6 : 1 }}
            >
              {isCancelling ? 'Скасування…' : 'Підтвердити'}
            </button>
          </div>
        </div>
      )}

      {isShowingLateFeeWarning && lateFeeCheckout && (
        <div style={{
          marginTop: 14, padding: '14px 16px',
          background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 13.5, color: '#78350F', lineHeight: 1.5 }}>
            <strong>Додано комісію за прострочення (20%).</strong>
            {' '}
            Вікно резервування вичерпано. Нова сума: ₴{lateFeeCheckout.totalAmount.toFixed(2)}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={onDismissLateFee} style={btnGhost}>Скасувати</button>
            <button onClick={onConfirmLateFee} style={btnPrimary}>Оплатити</button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function UpcomingTab({ bookings, isLoading, error, cancellingId, retryingPaymentId, lateFeeCheckout, onCancelBooking, onRetryPayment, onConfirmLateFee, onDismissLateFee }: Props) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[1, 2].map(i => (
          <div key={i} style={{ ...card, height: 88, background: '#F8F9FB', border: '1px solid #E7E9EE', borderRadius: 14 }} />
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
        <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>
          Немає запланованих занять
        </div>
        <div style={{ fontSize: 13.5, color: '#6B7280', marginBottom: 18 }}>
          Знайдіть тренера та заплануйте заняття
        </div>
        <button onClick={() => navigate('/search')} style={{
          padding: '9px 20px', background: 'var(--accent-600)', color: 'white',
          border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Знайти тренера
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {bookings.map((b, idx) => (
        <BookingCard
          key={b.id ?? idx}
          b={b}
          idx={idx}
          cancellingId={cancellingId}
          retryingPaymentId={retryingPaymentId}
          lateFeeCheckout={lateFeeCheckout}
          onCancelBooking={onCancelBooking}
          onRetryPayment={onRetryPayment}
          onConfirmLateFee={onConfirmLateFee}
          onDismissLateFee={onDismissLateFee}
        />
      ))}
    </div>
  );
}
