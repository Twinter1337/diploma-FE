interface DualRangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const rangeStyle: React.CSSProperties = {
  position: 'absolute', top: 0, left: 0, width: '100%', height: 20,
  background: 'transparent', appearance: 'none', pointerEvents: 'none',
  margin: 0,
};

export default function DualRangeSlider({ min, max, step, value, onChange }: DualRangeSliderProps) {
  const [lo, hi] = value;
  const pct = (n: number) => ((n - min) / (max - min)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#3F4651' }}>
        <span><strong style={{ color: '#0F172A' }}>{lo}</strong> грн</span>
        <span><strong style={{ color: '#0F172A' }}>{hi}{hi === max ? '+' : ''}</strong> грн</span>
      </div>
      <div style={{ position: 'relative', height: 20 }}>
        <div style={{
          position: 'absolute', top: 8, left: 0, right: 0, height: 4,
          background: '#EAECF0', borderRadius: 999,
        }} />
        <div style={{
          position: 'absolute', top: 8, height: 4,
          left: `${pct(lo)}%`, right: `${100 - pct(hi)}%`,
          background: 'var(--accent-600)', borderRadius: 999,
        }} />
        <input
          type="range" min={min} max={max} step={step} value={lo}
          onChange={e => onChange([Math.min(+e.target.value, hi - step), hi])}
          style={rangeStyle}
        />
        <input
          type="range" min={min} max={max} step={step} value={hi}
          onChange={e => onChange([lo, Math.max(+e.target.value, lo + step)])}
          style={rangeStyle}
        />
      </div>
    </div>
  );
}
