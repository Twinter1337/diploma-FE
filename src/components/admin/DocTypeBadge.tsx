import Icon from '../ui/Icon';
import type { AdminDocType } from '../../types';
import { DOC_TYPES } from './styles';

interface Props {
  type: AdminDocType;
  compact?: boolean;
}

export default function DocTypeBadge({ type, compact }: Props) {
  const d = DOC_TYPES[type];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: compact ? '2px 8px' : '4px 10px',
        borderRadius: 6,
        background: d.bg,
        color: d.color,
        fontSize: compact ? 10.5 : 12,
        fontWeight: 600,
        letterSpacing: '0.01em',
      }}
    >
      <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" size={compact ? 10 : 12} stroke={2.2} />
      {d.label}
    </span>
  );
}
