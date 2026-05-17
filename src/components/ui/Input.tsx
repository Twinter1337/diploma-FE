import type { ReactNode } from 'react';

interface InputProps {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  autoFocus?: boolean;
  error?: boolean;
}

export default function Input({
  label,
  required,
  type = 'text',
  value,
  onChange,
  placeholder,
  leftIcon,
  rightSlot,
  autoFocus,
  error,
}: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
        {label}{required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <span style={{
            position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
            color: '#9CA3AF', display: 'inline-flex', pointerEvents: 'none',
          }}>
            {leftIcon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            width: '100%',
            padding: leftIcon ? '12px 14px 12px 42px' : '12px 14px',
            paddingRight: rightSlot ? 44 : 14,
            borderRadius: 10,
            border: `1px solid ${error ? '#FCA5A5' : '#D9DCE2'}`,
            fontSize: 14,
            color: '#0F172A',
            fontFamily: 'inherit',
            background: 'white',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 120ms, box-shadow 120ms',
          }}
        />
        {rightSlot && (
          <span style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          }}>
            {rightSlot}
          </span>
        )}
      </div>
    </div>
  );
}
