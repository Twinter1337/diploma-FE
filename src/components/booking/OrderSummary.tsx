import type { ScheduleSlot, BookingTrainerSummary } from '../../types';
import Icon from '../ui/Icon';

export function calcServiceFee(price: number): number {
  return Math.round(price * 0.2);
}

function formatDateShort(iso: string) {
  return new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(iso),
  );
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  );
}

function durationLabel(start: string, end: string) {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (mins < 60) return `${mins} хв`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}г ${m}хв` : `${h}г`;
}

function TrainerAvatar({ name, size = 48 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('');
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, hsl(18 60% 62%), hsl(53 65% 45%))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{ color: 'white', fontWeight: 700, fontSize: size * 0.36, fontFamily: 'var(--display)' }}>
        {initials}
      </span>
    </div>
  );
}

function SummaryRow({ icon, text, sub }: { icon: React.ReactNode; text: string; sub?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ color: '#6B7280', display: 'inline-flex', marginTop: 2 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>{text}</div>
        {sub && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1, lineHeight: 1.4 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
      <span style={{ color: '#6B7280' }}>{label}</span>
      <span style={{ color: '#0F172A', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}

interface Props {
  slot: ScheduleSlot;
  trainer: BookingTrainerSummary;
  isLoading: boolean;
  onPay: () => void;
}

export default function OrderSummary({ slot, trainer, isLoading, onPay }: Props) {
  const trainerName = `${trainer.firstName} ${trainer.lastName}`;
  const serviceFee = calcServiceFee(slot.price);
  const total = slot.price + serviceFee;

  return (
    <aside
      style={{
        background: 'white',
        border: '1px solid #E7E9EE',
        borderRadius: 16,
        padding: 22,
        position: 'sticky',
        top: 24,
        alignSelf: 'flex-start',
      }}
    >
      <h2
        style={{
          margin: '0 0 16px',
          fontSize: 16,
          fontWeight: 700,
          color: '#0F172A',
          letterSpacing: '-0.02em',
          fontFamily: 'var(--display)',
        }}
      >
        Підсумок замовлення
      </h2>

      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          padding: 12,
          borderRadius: 12,
          background: '#FAFBFC',
          border: '1px solid #EDEFF3',
          marginBottom: 16,
        }}
      >
        <TrainerAvatar name={trainerName} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em' }}>
            {trainerName}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            {trainer.specializations.join(' · ')}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <SummaryRow
          icon={<Icon d="M8 2v3|M16 2v3|M3 9h18|M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" size={14} />}
          text={formatDateShort(slot.startTime)}
          sub={`${formatTime(slot.startTime)} · ${durationLabel(slot.startTime, slot.endTime)}`}
        />
        <SummaryRow
          icon={<Icon d="M12 21s-7-7.5-7-13a7 7 0 1114 0c0 5.5-7 13-7 13z|M12 11a2 2 0 100-4 2 2 0 000 4z" size={14} />}
          text={slot.format === 1 ? 'Офлайн' : 'Онлайн'}
        />
      </div>

      <div
        style={{
          borderTop: '1px solid #EDEFF3',
          paddingTop: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <Line label="Заняття" value={`${slot.price} грн`} />
        <Line label="Сервісний збір (20%)" value={`${serviceFee} грн`} />
      </div>

      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: '1px solid #EDEFF3',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Загалом</span>
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--display)',
          }}
        >
          {total} грн
        </span>
      </div>

      <button
        onClick={onPay}
        disabled={isLoading}
        style={{
          marginTop: 18,
          width: '100%',
          padding: '13px 16px',
          background: isLoading ? '#93C5FD' : 'var(--accent-600)',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          fontSize: 14.5,
          fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 4px 12px var(--accent-shadow)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'background 120ms',
        }}
        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = 'var(--accent-700)'; }}
        onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = 'var(--accent-600)'; }}
      >
        {isLoading ? 'Обробка...' : 'Перейти до оплати'}
        {!isLoading && <Icon d="M5 12h14|M13 6l6 6-6 6" size={16} stroke={2.2} />}
      </button>

      <div
        style={{
          marginTop: 14,
          padding: '10px 12px',
          borderRadius: 10,
          background: '#F8F9FB',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ color: '#6B7280', display: 'inline-flex' }}>
          <LockIcon />
        </span>
        <span style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.5 }}>
          Безпечна оплата через <strong style={{ color: '#0F172A' }}>Stripe</strong>. Підтримуються
          Visa, Mastercard, Apple Pay та Google Pay.
        </span>
      </div>
    </aside>
  );
}
