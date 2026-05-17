import type { CSSProperties } from 'react';
import type { AdminDocType, AdminTicketKanbanStatus } from '../../types';

export const card: CSSProperties = {
  background: 'white',
  border: '1px solid #E7E9EE',
  borderRadius: 14,
};

export const sectionTitle: CSSProperties = {
  margin: 0,
  fontSize: 17,
  fontWeight: 700,
  color: '#0F172A',
  letterSpacing: '-0.02em',
  fontFamily: 'var(--display, "Plus Jakarta Sans")',
};

export const btnPrimary: CSSProperties = {
  padding: '9px 16px',
  background: 'var(--accent-600)',
  color: 'white',
  border: 'none',
  borderRadius: 9,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

export const btnGhost: CSSProperties = {
  padding: '9px 14px',
  background: 'white',
  color: '#3F4651',
  border: '1.5px solid #E7E9EE',
  borderRadius: 9,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

export const btnSuccess: CSSProperties = {
  padding: '9px 16px',
  background: '#059669',
  color: 'white',
  border: 'none',
  borderRadius: 9,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

export const btnDanger: CSSProperties = {
  padding: '9px 14px',
  background: 'white',
  color: '#DC2626',
  border: '1.5px solid #FECACA',
  borderRadius: 9,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

export interface ColumnMeta {
  id: AdminTicketKanbanStatus;
  label: string;
  sub: string;
  dot: string;
  tint: string;
}

export const COLUMNS: readonly ColumnMeta[] = [
  { id: 'open',        label: 'Open',        sub: 'Нові звернення', dot: '#3B82F6', tint: '#EFF6FF' },
  { id: 'in_progress', label: 'In progress', sub: 'В обробці',      dot: '#F59E0B', tint: '#FFFBEB' },
  { id: 'resolved',    label: 'Resolved',    sub: 'Вирішено',       dot: '#10B981', tint: '#ECFDF5' },
  { id: 'closed',      label: 'Closed',      sub: 'Закрито',        dot: '#94A3B8', tint: '#F1F5F9' },
];

export const DOC_TYPES: Record<AdminDocType, { label: string; color: string; bg: string }> = {
  certificate: { label: 'Сертифікат', color: '#7C3AED', bg: '#F5F3FF' },
  diploma:     { label: 'Диплом',     color: '#0EA5E9', bg: '#F0F9FF' },
  license:     { label: 'Ліцензія',   color: '#059669', bg: '#ECFDF5' },
  other:       { label: 'Інше',       color: '#64748B', bg: '#F1F5F9' },
};
