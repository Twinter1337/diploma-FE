import Icon from '../ui/Icon';
import { btnGhost, btnDanger, btnSuccess, DOC_TYPES } from './styles';
import type { AdminTicketDocument } from '../../types';

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} МБ`;
  if (n >= 1024) return `${Math.round(n / 1024)} КБ`;
  return `${n} Б`;
}

interface Props {
  doc: AdminTicketDocument;
  busy?: boolean;
  canReview: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export default function DocumentPreview({ doc, busy, canReview, onApprove, onReject }: Props) {
  const docMeta = DOC_TYPES[doc.type];
  const ext = doc.fileName.split('.').pop()?.toUpperCase() ?? '';
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: '#6B7280',
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Документ
      </div>
      <div style={{ border: '1px solid #E7E9EE', borderRadius: 12, padding: 16, background: 'white' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div
            style={{
              width: 56,
              height: 72,
              borderRadius: 8,
              flexShrink: 0,
              background: `linear-gradient(180deg, ${docMeta.bg}, white)`,
              border: `1px solid ${docMeta.color}33`,
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: docMeta.color,
            }}
          >
            <Icon
              d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"
              size={22}
              stroke={1.6}
            />
            <span
              style={{
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 9,
                fontWeight: 700,
                color: 'white',
                background: docMeta.color,
                padding: '2px 6px',
                borderRadius: 4,
                letterSpacing: '0.04em',
              }}
            >
              {ext}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#0F172A',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {doc.fileName}
            </div>
            <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 3 }}>
              {docMeta.label} · {formatBytes(doc.fileSizeBytes)}
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#9CA3AF',
                marginTop: 4,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                wordBreak: 'break-all',
              }}
              title={doc.id}
            >
              ID: {doc.id}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              ...btnGhost,
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              textDecoration: 'none',
            }}
          >
            <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 100-6 3 3 0 000 6z" size={14} />
            Переглянути
          </a>
        </div>
        {canReview && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button disabled={busy} onClick={onReject} style={{ ...btnDanger, flex: 1, opacity: busy ? 0.6 : 1 }}>
              Відхилити
            </button>
            <button
              disabled={busy}
              onClick={onApprove}
              style={{
                ...btnSuccess,
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                opacity: busy ? 0.6 : 1,
              }}
            >
              <Icon d="M5 12l5 5 9-11" size={14} stroke={2.6} />
              Верифікувати
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
