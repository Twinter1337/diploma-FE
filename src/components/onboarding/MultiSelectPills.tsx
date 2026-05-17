import Icon from '../ui/Icon';

interface Option {
  value: number | string;
  label: string;
}

interface MultiSelectPillsProps {
  options: Option[];
  selected: (number | string)[];
  onToggle: (value: number | string) => void;
}

export default function MultiSelectPills({ options, selected, onToggle }: MultiSelectPillsProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {options.map((o) => {
        const active = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            style={{
              padding: '8px 14px', fontSize: 13, fontWeight: 500,
              borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
              background: active ? 'var(--accent-600)' : 'white',
              color: active ? 'white' : '#3F4651',
              border: `1.5px solid ${active ? 'var(--accent-600)' : '#D9DCE2'}`,
              transition: 'all 120ms',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            {active && <Icon d="M5 12l5 5 9-11" size={12} stroke={2.5} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
