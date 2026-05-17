import Icon from '../ui/Icon';
import TicketCard from './TicketCard';
import type { ColumnMeta } from './styles';
import type { AdminTicketListItem } from '../../types';

interface Props {
  col: ColumnMeta;
  tickets: AdminTicketListItem[];
  draggingId: string | null;
  hoverOver: string | null;
  setHoverOver: (v: string | null) => void;
  onDropTicket: (id: string, statusKey: ColumnMeta['id']) => void;
  onOpen: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

export default function KanbanColumn({
  col,
  tickets,
  draggingId,
  hoverOver,
  setHoverOver,
  onDropTicket,
  onOpen,
  onDragStart,
  onDragEnd,
}: Props) {
  const isHover = hoverOver === col.id;
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setHoverOver(col.id);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setHoverOver(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (id) onDropTicket(id, col.id);
        setHoverOver(null);
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 480,
        maxHeight: 'calc(100vh - 220px)',
        background: isHover ? col.tint : '#F4F5F8',
        borderRadius: 14,
        border: isHover ? `2px dashed ${col.dot}` : '2px dashed transparent',
        padding: 12,
        transition: 'background 120ms, border-color 120ms',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 6px 12px',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot }} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.01em',
              fontFamily: 'var(--display, "Plus Jakarta Sans")',
            }}
          >
            {col.label}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#6B7280',
              background: 'white',
              border: '1px solid #E7E9EE',
              padding: '1px 8px',
              borderRadius: 999,
            }}
          >
            {tickets.length}
          </span>
        </div>
        <button
          style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#9CA3AF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon d="M12 5v14 M5 12h14" size={14} stroke={2.4} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingRight: 4 }}>
        {tickets.map((t) => (
          <TicketCard
            key={t.id}
            ticket={t}
            onOpen={onOpen}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            dragging={draggingId === t.id}
          />
        ))}
        {tickets.length === 0 && (
          <div
            style={{
              border: '1.5px dashed #D9DCE2',
              borderRadius: 10,
              padding: '26px 14px',
              textAlign: 'center',
              fontSize: 12.5,
              color: '#9CA3AF',
            }}
          >
            Перетягніть тікет сюди
          </div>
        )}
      </div>
    </div>
  );
}
