import { useIsMobile } from '../../hooks/useWindowWidth';

export const REMINDER_OPTIONS = [
  { minutes: 10, label: 'За 10 хвилин' },
  { minutes: 30, label: 'За 30 хвилин' },
  { minutes: 60, label: 'За 1 годину' },
  { minutes: 120, label: 'За 2 години' },
  { minutes: 180, label: 'За 3 години' },
  { minutes: 0, label: 'Не нагадувати' },
] as const;

interface Props {
  value: number;
  onChange: (minutes: number) => void;
}

export default function ReminderSection({ value, onChange }: Props) {
  const isMobile = useIsMobile();
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
          margin: 0,
          fontSize: 17,
          fontWeight: 700,
          color: '#0F172A',
          letterSpacing: '-0.02em',
          fontFamily: 'var(--display)',
        }}
      >
        Нагадування
      </h2>
      <p style={{ margin: '6px 0 16px', fontSize: 13.5, color: '#6B7280' }}>
        Ми надішлемо вам повідомлення на електронну адресу перед заняттям
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
        gap: 8,
      }}>
        {REMINDER_OPTIONS.map((o) => {
          const active = value === o.minutes;
          return (
            <label
              key={o.minutes}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: isMobile ? '10px 12px' : '12px 14px',
                borderRadius: 10,
                background: active ? 'var(--accent-50)' : 'white',
                border: `1.5px solid ${active ? 'var(--accent-600)' : '#E7E9EE'}`,
                cursor: 'pointer',
                transition: 'all 120ms',
                minWidth: 0,
              }}
            >
              <input
                type="radio"
                name="reminder"
                checked={active}
                onChange={() => onChange(o.minutes)}
                style={{ width: 16, height: 16, accentColor: 'var(--accent-600)', margin: 0, cursor: 'pointer', flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--accent-700)' : '#3F4651',
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {o.label}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
