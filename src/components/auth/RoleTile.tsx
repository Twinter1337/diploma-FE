import type { ReactNode } from 'react';

interface RoleTileProps {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
  icon: ReactNode;
}

export default function RoleTile({ active, onClick, label, sub, icon }: RoleTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '16px 18px',
        borderRadius: 12,
        cursor: 'pointer',
        textAlign: 'left',
        background: active ? 'var(--auth-accent-50)' : 'white',
        border: `1.5px solid ${active ? 'var(--auth-accent-600)' : '#E7E9EE'}`,
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'all 140ms',
        width: '100%',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: active ? 'var(--auth-accent-600)' : '#F1F2F4',
        color: active ? 'white' : '#6B7280',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em',
          color: active ? 'var(--auth-accent-700)' : '#0F172A',
        }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{sub}</div>
      </div>
    </button>
  );
}
