interface Option<T extends string> {
  id: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<Option<T>>;
}

export default function FilterGroup<T extends string>({ value, onChange, options }: Props<T>) {
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: 3,
        background: '#F1F2F4',
        borderRadius: 9,
        gap: 2,
      }}
    >
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            style={{
              padding: '6px 12px',
              borderRadius: 7,
              background: active ? 'white' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              color: active ? '#0F172A' : '#6B7280',
              boxShadow: active ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
              transition: 'all 120ms',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
