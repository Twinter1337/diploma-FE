import Icon from '../ui/Icon';
import StatusPill from './StatusPill';
import DocTypeBadge from './DocTypeBadge';
import AssigneeChip from './AssigneeChip';
import { DOC_TYPES } from './styles';
import type { AdminTicketListItem } from '../../types';

interface Props {
  ticket: AdminTicketListItem;
  onOpen: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  dragging: boolean;
}

export default function TicketCard({ ticket, onOpen, onDragStart, onDragEnd, dragging }: Props) {
  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ticket.id);
        onDragStart(ticket.id);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(ticket.id)}
      onMouseEnter={(e) => {
        if (!dragging) (e.currentTarget as HTMLElement).style.borderColor = '#CBD5E1';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = '#E7E9EE';
      }}
      style={{
        background: 'white',
        border: '1px solid #E7E9EE',
        borderRadius: 12,
        padding: 14,
        cursor: 'grab',
        boxShadow: dragging ? '0 16px 32px -10px rgba(15,23,42,0.25)' : '0 1px 0 rgba(15,23,42,0.02)',
        opacity: dragging ? 0.4 : 1,
        transition: 'box-shadow 120ms, transform 120ms',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span
          title={ticket.id}
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            color: '#6B7280',
            letterSpacing: '0.02em',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
            flex: 1,
            marginRight: 8,
          }}
        >
          {ticket.id}
        </span>
        {ticket.type === 'document' && ticket.docType && (
          <span
            title="Перевірка документа"
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: DOC_TYPES[ticket.docType].bg,
              color: DOC_TYPES[ticket.docType].color,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" size={11} stroke={2.2} />
          </span>
        )}
      </div>

      <h3
        style={{
          margin: '0 0 10px',
          fontSize: 13.5,
          fontWeight: 600,
          color: '#0F172A',
          letterSpacing: '-0.01em',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {ticket.subject}
      </h3>

      {ticket.type === 'document' && ticket.docType && (
        <div style={{ marginBottom: 10 }}>
          <DocTypeBadge type={ticket.docType} compact />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          paddingTop: 10,
          borderTop: '1px solid #EDEFF3',
        }}
      >
        <StatusPill status={ticket.status} />
        <AssigneeChip assignee={ticket.assignedTo} />
      </div>
    </article>
  );
}
