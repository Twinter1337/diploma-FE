import { useState } from 'react';
import Icon from '../ui/Icon';

interface Option {
  value: number | string;
  label: string;
}

interface MultiSelectPillsProps {
  options: Option[];
  selected: (number | string)[];
  onToggle: (value: number | string) => void;
  compact?: boolean;
  initialVisible?: number;
}

export default function MultiSelectPills({
  options, selected, onToggle, compact = false, initialVisible,
}: MultiSelectPillsProps) {
  const [expanded, setExpanded] = useState(false);

  const shouldCollapse = initialVisible !== undefined && options.length > initialVisible;
  const visible = shouldCollapse && !expanded ? options.slice(0, initialVisible) : options;
  const hiddenCount = options.length - (initialVisible ?? options.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: compact ? 6 : 7 }}>
        {visible.map((o) => {
          const active = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onToggle(o.value)}
              style={{
                padding: compact ? '5px 10px' : '8px 14px',
                fontSize: compact ? 12 : 13,
                fontWeight: 500,
                borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                background: active ? 'var(--accent-600)' : 'white',
                color: active ? 'white' : '#3F4651',
                border: `1.5px solid ${active ? 'var(--accent-600)' : '#D9DCE2'}`,
                transition: 'all 120ms',
                display: 'inline-flex', alignItems: 'center',
                gap: compact ? 5 : 6,
                lineHeight: 1.4,
              }}
            >
              {active && <Icon d="M5 12l5 5 9-11" size={compact ? 11 : 12} stroke={2.5} />}
              {o.label}
            </button>
          );
        })}
      </div>

      {shouldCollapse && (
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          style={{
            alignSelf: 'flex-start',
            background: 'none', border: 'none', padding: 0,
            fontSize: 12, color: 'var(--accent-600)', cursor: 'pointer',
            fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4,
            transition: 'color 120ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-700)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent-600)')}
        >
          <Icon
            d={expanded ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
            size={12}
            stroke={2.5}
          />
          {expanded ? 'Сховати' : `Показати ще ${hiddenCount}`}
        </button>
      )}
    </div>
  );
}
