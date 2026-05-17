interface DividerProps {
  label?: string;
}

export default function Divider({ label = 'або' }: DividerProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: '#E7E9EE' }} />
      <span style={{ fontSize: 12.5, color: '#9CA3AF', fontWeight: 500 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: '#E7E9EE' }} />
    </div>
  );
}
