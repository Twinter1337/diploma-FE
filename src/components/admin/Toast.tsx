import { useEffect } from 'react';
import Icon from '../ui/Icon';

interface Props {
  msg: string;
  tone?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ msg, tone = 'success', onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);
  const dot = tone === 'success' ? '#10B981' : '#DC2626';
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#0F172A',
        color: 'white',
        padding: '11px 18px',
        borderRadius: 10,
        fontSize: 13.5,
        fontWeight: 500,
        boxShadow: '0 12px 28px -8px rgba(15,23,42,0.4)',
        zIndex: 80,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        animation: 'adminFadeUp 200ms ease',
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: dot,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <Icon d="M5 12l5 5 9-11" size={11} stroke={3} />
      </span>
      {msg}
    </div>
  );
}
