import type { ScheduleSlot, BookingTrainerSummary } from '../../types';
import { SlotFormat } from '../../types';
import Icon from '../ui/Icon';
import { useIsMobile } from '../../hooks/useWindowWidth';

function formatDateUk(iso: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

function formatWeekdayUk(iso: string) {
  return new Intl.DateTimeFormat('uk-UA', { weekday: 'long' }).format(new Date(iso));
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  );
}

function durationLabel(start: string, end: string) {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (mins < 60) return `${mins} хвилин`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} год ${m} хв` : `${h} година`;
}

function TrainerAvatar({ name, size = 56 }: { name: string; size?: number }) {
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

function DetailRow({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '32px 1fr',
        gap: 14,
        padding: '14px 0',
        borderBottom: '1px solid #EDEFF3',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'var(--accent-50)',
          color: 'var(--accent-700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14.5, color: '#0F172A', fontWeight: 600 }}>{value}</div>
        {sub && <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

interface Props {
  slot: ScheduleSlot;
  trainer: BookingTrainerSummary;
}

export default function SessionDetails({ slot, trainer }: Props) {
  const isMobile = useIsMobile();
  const trainerName = `${trainer.firstName} ${trainer.lastName}`;
  const locationValue =
    slot.format === SlotFormat.Offline && slot.gymName ? slot.gymName : 'Онлайн';
  const locationSub =
    slot.format === SlotFormat.Offline && slot.gymAddress ? slot.gymAddress : undefined;

  return (
    <section
      style={{
        background: 'white',
        border: '1px solid #E7E9EE',
        borderRadius: 16,
        padding: isMobile ? 18 : 24,
      }}
    >
      <h2
        style={{
          margin: '0 0 4px',
          fontSize: 17,
          fontWeight: 700,
          color: '#0F172A',
          letterSpacing: '-0.02em',
          fontFamily: 'var(--display)',
        }}
      >
        Деталі заняття
      </h2>

      {/* Trainer row */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
          padding: '14px 0',
          borderBottom: '1px solid #EDEFF3',
        }}
      >
        <TrainerAvatar name={trainerName} size={isMobile ? 44 : 56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 8,
          }}>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em', minWidth: 0 }}>
              {trainerName}
            </div>
            {!isMobile && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: '#F8F9FB',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Не редагується
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, alignItems: 'center' }}>
            {trainer.specializations.map((s) => (
              <span
                key={s}
                style={{
                  padding: '2px 8px',
                  fontSize: 11.5,
                  fontWeight: 500,
                  borderRadius: 999,
                  background: '#F1F2F4',
                  color: '#3F4651',
                  whiteSpace: 'nowrap',
                }}
              >
                {s}
              </span>
            ))}
            {trainer.rating > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
                <span style={{ color: '#F5A524' }}>★</span>
                {trainer.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      <DetailRow
        icon={<Icon d="M8 2v3|M16 2v3|M3 9h18|M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" size={16} />}
        label="Дата та час"
        value={`${formatDateUk(slot.startTime)}, ${formatTime(slot.startTime)}`}
        sub={formatWeekdayUk(slot.startTime)}
      />

      <DetailRow
        icon={<Icon d="M12 21s-7-7.5-7-13a7 7 0 1114 0c0 5.5-7 13-7 13z|M12 11a2 2 0 100-4 2 2 0 000 4z" size={16} />}
        label="Формат"
        value={slot.format === SlotFormat.Offline ? 'Офлайн' : 'Онлайн'}
        sub={locationSub ?? (slot.format === SlotFormat.Offline ? locationValue : undefined)}
      />

      <DetailRow
        icon={<Icon d="M12 8v4l3 2|M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={16} />}
        label="Тривалість"
        value={durationLabel(slot.startTime, slot.endTime)}
      />

      {/* Price row — no bottom border */}
      <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 14, padding: '14px 0' }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--accent-50)',
            color: 'var(--accent-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon d="M12 1v22|M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" size={16} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>Вартість</div>
          <div style={{ fontSize: 15.5, color: '#0F172A', fontWeight: 700, letterSpacing: '-0.01em' }}>
            {slot.price} грн
          </div>
        </div>
      </div>
    </section>
  );
}
