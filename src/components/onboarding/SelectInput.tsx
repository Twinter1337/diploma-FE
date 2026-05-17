import Icon from '../ui/Icon';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
}

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #D9DCE2',
  fontSize: 14, color: '#0F172A', fontFamily: 'inherit', background: 'white',
  outline: 'none', boxSizing: 'border-box', appearance: 'none', paddingRight: 36, cursor: 'pointer',
};

export default function SelectInput({ label, value, onChange, options, placeholder, required }: SelectInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
          {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}>
          <Icon d="M6 9l6 6 6-6" size={16} />
        </span>
      </div>
    </div>
  );
}
