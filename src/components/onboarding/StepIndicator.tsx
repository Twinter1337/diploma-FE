import Icon from '../ui/Icon';

interface StepIndicatorProps {
  currentStep: number;
  labels: string[];
}

export default function StepIndicator({ currentStep, labels }: StepIndicatorProps) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {labels.map((label, i) => {
          const idx = i + 1;
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: idx < labels.length ? undefined : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: done ? 'var(--accent-600)' : (active ? 'var(--accent-50)' : '#F1F2F4'),
                  border: active ? '2px solid var(--accent-600)' : 'none',
                  color: done ? 'white' : (active ? 'var(--accent-700)' : '#9CA3AF'),
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, fontFamily: 'var(--display)',
                  transition: 'all 200ms',
                  flexShrink: 0,
                }}>
                  {done ? <Icon d="M5 12l5 5 9-11" size={15} stroke={2.4} /> : idx}
                </div>
                <span style={{
                  fontSize: 13.5, fontWeight: active ? 600 : 500,
                  color: active ? '#0F172A' : (done ? '#3F4651' : '#9CA3AF'),
                  whiteSpace: 'nowrap',
                }}>{label}</span>
              </div>
              {idx < labels.length && (
                <div style={{
                  flex: 1, height: 2, minWidth: 24,
                  background: done ? 'var(--accent-600)' : '#E7E9EE',
                  borderRadius: 1, transition: 'background 200ms',
                  marginLeft: 8,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
