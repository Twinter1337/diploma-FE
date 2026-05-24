const LABELS = ['Слабкий', 'Слабкий', 'Середній', 'Хороший', 'Надійний'];
const COLORS = ['#DC2626', '#DC2626', '#F59E0B', '#2563EB', '#10B981'];

function getScore(value: string): number {
  return (
    (value.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(value) ? 1 : 0) +
    (/[0-9]/.test(value) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(value) ? 1 : 0)
  );
}

interface PasswordStrengthProps {
  value: string;
}

export default function PasswordStrength({ value }: PasswordStrengthProps) {
  const s = getScore(value);
  return (
    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i < s ? COLORS[s] : '#E7E9EE',
              transition: 'background 200ms',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: COLORS[s], whiteSpace: 'nowrap' }}>
        {LABELS[s]}
      </span>
    </div>
  );
}
