import { COLUMNS } from './styles';
import { statusIntToKey } from '../../services/adminService';

export default function StatusPill({ status }: { status: number }) {
  const key = statusIntToKey(status);
  const c = COLUMNS.find((x) => x.id === key) ?? COLUMNS[0];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px 3px 7px',
        borderRadius: 999,
        background: c.tint,
        color: '#0F172A',
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        border: `1px solid ${c.dot}33`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {c.label}
    </span>
  );
}
