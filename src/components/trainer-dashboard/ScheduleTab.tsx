import { useState } from 'react';
import type { TrainerDashboardSlot, TrainerSlotCount, TrainerSlotFilters, PatchSlotPayload } from '../../types';
import { SlotFormat, SlotStatus } from '../../types';
import DashAvatar from './DashAvatar';

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #E7E9EE', borderRadius: 14, padding: 18,
};
const btnGhost: React.CSSProperties = {
  padding: '8px 14px', background: 'white', color: '#3F4651',
  border: '1.5px solid #E7E9EE', borderRadius: 9,
  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};
const btnPrimary: React.CSSProperties = {
  padding: '8px 14px', background: 'var(--accent-600)', color: 'white',
  border: 'none', borderRadius: 9,
  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};
const inputStyle: React.CSSProperties = {
  padding: '9px 11px', border: '1px solid #D9DCE2', borderRadius: 8,
  fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: 'white',
  color: '#0F172A', boxSizing: 'border-box',
};

const WEEKDAYS_UK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const MONTHS_UK = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

function toYMD(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function CalendarWidget({
  slots,
  selectedDate,
  onSelectDate,
}: {
  slots: TrainerDashboardSlot[];
  selectedDate: string | null;
  onSelectDate: (ymd: string | null) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const slotDays = new Set(slots.map(s => toYMD(new Date(s.startDateTime))));
  const todayYMD = toYMD(today);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  // Monday-based: getDay() returns 0=Sun; adjust so Mon=0
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const cells: Array<number | null> = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null);
  }

  return (
    <div style={{ ...card, padding: 20, userSelect: 'none' }}>
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          type="button"
          onClick={prevMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 7, color: '#6B7280', lineHeight: 1, fontSize: 16 }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >‹</button>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
          {MONTHS_UK[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 7, color: '#6B7280', lineHeight: 1, fontSize: 16 }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >›</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {WEEKDAYS_UK.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9CA3AF', padding: '2px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = ymd === todayYMD;
          const isSel = ymd === selectedDate;
          const hasSlots = slotDays.has(ymd);

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDate(isSel ? null : ymd)}
              style={{
                position: 'relative',
                width: '100%', aspectRatio: '1',
                background: isSel ? 'var(--accent-600)' : 'transparent',
                color: isSel ? 'white' : isToday ? 'var(--accent-600)' : '#0F172A',
                border: isToday && !isSel ? '1.5px solid var(--accent-600)' : '1.5px solid transparent',
                borderRadius: 8,
                fontSize: 13, fontWeight: isSel || isToday ? 700 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 2,
                transition: 'background 120ms',
              }}
              onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#F1F5F9'; }}
              onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
            >
              {day}
              {hasSlots && (
                <span style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: isSel ? 'rgba(255,255,255,0.8)' : 'var(--accent-600)',
                  flexShrink: 0,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <button
          type="button"
          onClick={() => onSelectDate(null)}
          style={{
            marginTop: 14, width: '100%', padding: '7px 0',
            background: 'none', border: '1px solid #E7E9EE', borderRadius: 8,
            fontSize: 12.5, fontWeight: 600, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          Показати всі
        </button>
      )}
    </div>
  );
}

type SlotGroup = { dateLabel: string; items: TrainerDashboardSlot[] };

function groupByDate(slots: TrainerDashboardSlot[]): SlotGroup[] {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);
  const map: Record<string, TrainerDashboardSlot[]> = {};

  for (const s of slots) {
    const d = new Date(s.startDateTime); d.setHours(0, 0, 0, 0);
    let label: string;
    if (d.getTime() === today.getTime()) {
      label = 'Сьогодні · ' + d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
    } else if (d.getTime() === tomorrow.getTime()) {
      label = 'Завтра · ' + d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
    } else {
      label = d.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    (map[label] ??= []).push(s);
  }
  return Object.entries(map).map(([dateLabel, items]) => ({ dateLabel, items }));
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toLocalISOString(datetimeLocal: string): string {
  const d = new Date(datetimeLocal);
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${sign}${hh}:${mm}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

interface FilterDraft {
  isClosed: boolean;
  isReserved: boolean;
  minPrice: string;
  maxPrice: string;
  timeFrom: string;
  timeTo: string;
}

const emptyDraft = (): FilterDraft => ({
  isClosed: false,
  isReserved: false,
  minPrice: '',
  maxPrice: '',
  timeFrom: '',
  timeTo: '',
});

function hasActiveFilters(d: FilterDraft): boolean {
  return d.isClosed || d.isReserved || !!d.minPrice || !!d.maxPrice || !!d.timeFrom || !!d.timeTo;
}

function FilterCheckbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: 13, color: '#374151', userSelect: 'none' }}>
      <span style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        border: checked ? 'none' : '1.5px solid #D1D5DB',
        background: checked ? 'var(--accent-600)' : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 120ms, border 120ms',
      }}>
        {checked && (
          <svg width={9} height={9} viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input
        type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
      />
      {label}
    </label>
  );
}

function SlotFilterPanel({ onApply }: { onApply: (f: TrainerSlotFilters) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDraft>(emptyDraft);
  const [applied, setApplied] = useState(false);

  const upd = <K extends keyof FilterDraft>(k: K, v: FilterDraft[K]) =>
    setDraft(d => ({ ...d, [k]: v }));

  const handleApply = () => {
    const f: TrainerSlotFilters = {};
    if (draft.isClosed) f.isClosed = true;
    if (draft.isReserved) f.isReserved = true;
    if (draft.minPrice) f.minPrice = parseFloat(draft.minPrice);
    if (draft.maxPrice) f.maxPrice = parseFloat(draft.maxPrice);
    if (draft.timeFrom) f.timeFrom = `${draft.timeFrom}:00`;
    if (draft.timeTo) f.timeTo = `${draft.timeTo}:00`;
    onApply(f);
    setApplied(hasActiveFilters(draft));
  };

  const handleReset = () => {
    setDraft(emptyDraft());
    onApply({});
    setApplied(false);
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 10.5, fontWeight: 700, color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10,
  };
  const fieldLabel: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, color: '#9CA3AF', marginBottom: 3, letterSpacing: '0.02em',
  };
  const filterInput: React.CSSProperties = {
    ...inputStyle, fontSize: 12.5, width: '100%', minWidth: 0, padding: '0 10px', height: 34,
  };

  return (
    <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Фільтри
          {applied && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-600)', flexShrink: 0,
            }} />
          )}
        </span>
        <svg
          width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2.2}
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 18, borderTop: '1px solid #F1F5F9' }}>

          {/* Status */}
          <div style={{ paddingTop: 14 }}>
            <div style={sectionLabel}>Статус</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FilterCheckbox checked={draft.isClosed} onChange={v => upd('isClosed', v)} label="Завершені та скасовані" />
              <FilterCheckbox checked={draft.isReserved} onChange={v => upd('isReserved', v)} label="Заброньовані" />
            </div>
          </div>

          {/* Price */}
          <div>
            <div style={sectionLabel}>Ціна (грн)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={fieldLabel}>Від</div>
                <input type="number" placeholder="0" value={draft.minPrice} onChange={e => upd('minPrice', e.target.value)} style={filterInput} min="0" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={fieldLabel}>До</div>
                <input type="number" placeholder="∞" value={draft.maxPrice} onChange={e => upd('maxPrice', e.target.value)} style={filterInput} min="0" />
              </div>
            </div>
          </div>

          {/* Time */}
          <div>
            <div style={sectionLabel}>Час початку</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={fieldLabel}>Від</div>
                <input type="time" value={draft.timeFrom} onChange={e => upd('timeFrom', e.target.value)} style={filterInput} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={fieldLabel}>До</div>
                <input type="time" value={draft.timeTo} onChange={e => upd('timeTo', e.target.value)} style={filterInput} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button type="button" onClick={handleReset} style={{ ...btnGhost, fontSize: 12.5, padding: '8px 10px' }}>
              Скинути
            </button>
            <button type="button" onClick={handleApply} style={{ ...btnPrimary, fontSize: 12.5, padding: '8px 10px' }}>
              Застосувати
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface EditState {
  startDate: string;
  startHour: string;
  endHour: string;
  format: SlotFormat;
  price: string;
  maxClients: string;
  description: string;
  gymName: string;
  gymAddress: string;
}

function splitDatetime(datetimeLocal: string): { date: string; hour: string } {
  const [date, hour] = datetimeLocal.split('T');
  return { date: date ?? '', hour: hour ?? '' };
}

function SlotCard({
  slot,
  index,
  onUpdate,
  onDelete,
}: {
  slot: TrainerDashboardSlot;
  index: number;
  onUpdate: (id: string, payload: PatchSlotPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const endISO = new Date(
    new Date(slot.startDateTime).getTime() + slot.durationInMinutes * 60000,
  ).toISOString();

  const initForm = (): EditState => {
    const start = splitDatetime(toDatetimeLocal(slot.startDateTime));
    const end = splitDatetime(toDatetimeLocal(endISO));
    return {
      startDate: start.date,
      startHour: start.hour,
      endHour: end.hour,
      format: slot.format,
      price: String(slot.price),
      maxClients: String(slot.maxClients),
      description: slot.description ?? '',
      gymName: slot.gymName ?? '',
      gymAddress: slot.gymAddress ?? '',
    };
  };

  const [form, setForm] = useState<EditState>(initForm);

  const upd = (k: keyof EditState, v: string | SlotFormat) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleEdit = () => {
    setForm(initForm());
    setEditing(e => !e);
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await onUpdate(slot.id, {
        startTime: toLocalISOString(`${form.startDate}T${form.startHour}`),
        endTime: toLocalISOString(`${form.startDate}T${form.endHour}`),
        format: form.format,
        price: parseFloat(form.price),
        maxClients: parseInt(form.maxClients, 10),
        description: form.description || null,
        gymName: form.gymName || null,
        gymAddress: form.gymAddress || null,
      });
      setEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    setDeleting(true);
    try {
      await onDelete(slot.id);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Помилка видалення');
    } finally {
      setDeleting(false);
    }
  };

  const capacityPct = slot.maxClients > 0
    ? Math.min((slot.currentNumOfClients / slot.maxClients) * 100, 100)
    : 0;

  const isPast = new Date(slot.startDateTime) <= new Date();
  const isCancelled = slot.status === SlotStatus.Cancelled;
  const isReadonly = isPast || isCancelled;

  return (
    <article style={{ ...card, padding: 16, opacity: isCancelled ? 0.72 : 1 }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center',
      }}>
        <DashAvatar name={String(index)} size={48} />

        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
            {formatTime(slot.startDateTime)} · {slot.durationInMinutes} хв
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12.5, color: '#6B7280', flexWrap: 'wrap' }}>
            <span style={{
              padding: '2px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
              background: slot.format === SlotFormat.Online ? '#EFF6FF' : '#F0FDF4',
              color: slot.format === SlotFormat.Online ? '#1D4ED8' : '#15803D',
            }}>
              {slot.format === SlotFormat.Online ? 'Онлайн' : 'Офлайн'}
            </span>
            {isCancelled && (
              <span style={{
                padding: '2px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                background: '#FEF2F2', color: '#B91C1C',
              }}>
                Скасовано
              </span>
            )}
            <span style={{ fontWeight: 600, color: '#0F172A' }}>{slot.price} грн</span>
            <span>{slot.currentNumOfClients}/{slot.maxClients} клієнтів</span>
          </div>
          <div style={{ marginTop: 8, height: 4, background: '#E7E9EE', borderRadius: 999, overflow: 'hidden', maxWidth: 160 }}>
            <div style={{
              height: '100%', borderRadius: 999,
              width: `${capacityPct}%`,
              background: capacityPct >= 100 ? '#EF4444' : 'var(--accent-600)',
              transition: 'width 300ms',
            }} />
          </div>
        </div>

        {isReadonly ? (
          <button onClick={() => setViewing(v => !v)} style={btnGhost}>
            {viewing ? 'Закрити' : 'Переглянути'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleEdit} style={btnGhost}>
              {editing ? 'Закрити' : 'Редагувати'}
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
              title="Видалити слот"
              style={{
                background: 'none', border: '1.5px solid #FECACA', borderRadius: 9,
                cursor: 'pointer', padding: '8px 10px', color: '#EF4444',
                opacity: deleting ? 0.4 : 1, flexShrink: 0,
              }}
            >
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {viewing && isReadonly && (
        <div style={{
          marginTop: 16, paddingTop: 16, borderTop: '1px solid #EDEFF3',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {/* Date + start/end times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
              Дата
              <input type="date" disabled value={form.startDate} style={{ ...inputStyle, background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
              Початок
              <input type="time" disabled value={form.startHour} style={{ ...inputStyle, width: 90, background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
              Кінець
              <input type="time" disabled value={form.endHour} style={{ ...inputStyle, width: 90, background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' }} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
              Формат
              <select disabled value={form.format} style={{ ...inputStyle, background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' }}>
                <option value={SlotFormat.Online}>Онлайн</option>
                <option value={SlotFormat.Offline}>Офлайн</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
              Ціна (грн)
              <input type="number" disabled value={form.price} style={{ ...inputStyle, background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
              Макс. клієнтів
              <input type="number" disabled value={form.maxClients} style={{ ...inputStyle, background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' }} />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
            Опис (необов'язково)
            <input disabled value={form.description} placeholder="Наприклад: Візьміть каремат" style={{ ...inputStyle, background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' }} />
          </label>

          {Number(form.format) === SlotFormat.Offline && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
                Назва залу
                <input disabled value={form.gymName} style={{ ...inputStyle, background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
                Адреса
                <input disabled value={form.gymAddress} style={{ ...inputStyle, background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' }} />
              </label>
            </div>
          )}
        </div>
      )}

      {confirmDelete && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setConfirmDelete(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: 16, padding: '28px 28px 24px',
              width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              display: 'flex', flexDirection: 'column', gap: 20,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Видалити слот?</div>
              <div style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.5 }}>
                {formatTime(slot.startDateTime)} · {slot.durationInMinutes} хв — цю дію не можна скасувати.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                style={btnGhost}
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  ...btnPrimary,
                  background: '#EF4444',
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Видалення…' : 'Так, видалити'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div style={{
          marginTop: 16, paddingTop: 16, borderTop: '1px solid #EDEFF3',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {/* Date + start/end times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
              Дата
              <input
                type="date"
                value={form.startDate}
                onChange={e => upd('startDate', e.target.value)}
                style={inputStyle}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
              Початок
              <input
                type="time"
                value={form.startHour}
                onChange={e => upd('startHour', e.target.value)}
                style={{ ...inputStyle, width: 90 }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
              Кінець
              <input
                type="time"
                value={form.endHour}
                onChange={e => upd('endHour', e.target.value)}
                style={{ ...inputStyle, width: 90 }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
              Формат
              <select
                value={form.format}
                onChange={e => upd('format', Number(e.target.value) as SlotFormat)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value={SlotFormat.Online}>Онлайн</option>
                <option value={SlotFormat.Offline}>Офлайн</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
              Ціна (грн)
              <input
                type="number"
                value={form.price}
                onChange={e => upd('price', e.target.value)}
                style={inputStyle}
                min="0.01"
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
              Макс. клієнтів
              <input
                type="number"
                value={form.maxClients}
                onChange={e => upd('maxClients', e.target.value)}
                style={inputStyle}
                min="1"
                max="100"
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
            Опис (необов'язково)
            <input
              value={form.description}
              onChange={e => upd('description', e.target.value)}
              style={inputStyle}
              placeholder="Наприклад: Візьміть каремат"
            />
          </label>

          {Number(form.format) === SlotFormat.Offline && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
                Назва залу
                <input
                  value={form.gymName}
                  onChange={e => upd('gymName', e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
                Адреса
                <input
                  value={form.gymAddress}
                  onChange={e => upd('gymAddress', e.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
          )}

          {saveError && (
            <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#B91C1C' }}>
              {saveError}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditing(false)} style={btnGhost}>Скасувати</button>
            <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Збереження…' : 'Зберегти'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

interface Props {
  slots: TrainerDashboardSlot[];
  slotCount: TrainerSlotCount | null;
  isLoading: boolean;
  error: string | null;
  onUpdateSlot: (slotId: string, payload: PatchSlotPayload) => Promise<void>;
  onDeleteSlot: (slotId: string) => Promise<void>;
  onFiltersChange: (filters: TrainerSlotFilters) => void;
}

export default function ScheduleTab({ slots, slotCount, isLoading, error, onUpdateSlot, onDeleteSlot, onFiltersChange }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [panelFilters, setPanelFilters] = useState<TrainerSlotFilters>({});

  const handleDateSelect = (ymd: string | null) => {
    setSelectedDate(ymd);
    onFiltersChange({ ...panelFilters, ...(ymd ? { dateFrom: ymd, dateTo: ymd } : {}) });
  };

  const handlePanelApply = (filters: TrainerSlotFilters) => {
    setPanelFilters(filters);
    onFiltersChange({ ...filters, ...(selectedDate ? { dateFrom: selectedDate, dateTo: selectedDate } : {}) });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ ...card, height: 320, background: '#F8F9FB' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ ...card, height: 80, background: '#F8F9FB' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...card, padding: '32px 24px', textAlign: 'center', color: '#DC2626', fontSize: 14 }}>
        {error}
      </div>
    );
  }

  const groups = groupByDate(slots);

  const selectedLabel = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'flex-start' }}>
      {/* Left column: calendar + counts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <CalendarWidget
          slots={slots}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
        />

        {slotCount && (
          <div style={{ ...card, padding: '14px 20px', display: 'flex', gap: 0 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Всього</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', fontFamily: 'var(--display)' }}>{slotCount.numOfAllSlots}</div>
            </div>
            <div style={{ width: 1, background: '#E7E9EE', margin: '0 16px' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Заброньовано</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', fontFamily: 'var(--display)' }}>{slotCount.numOfBookedSlots}</div>
            </div>
          </div>
        )}

        <SlotFilterPanel onApply={handlePanelApply} />
      </div>

      {/* Right column: slot list */}
      <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
        {selectedLabel && (
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-600)',
            }} />
            {selectedLabel}
          </div>
        )}

        {groups.length === 0 ? (
          <div style={{ ...card, padding: '60px 24px', textAlign: 'center', border: '1px dashed #D9DCE2' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>
              {selectedDate ? 'На цей день немає слотів' : 'Немає доступних слотів'}
            </div>
            <div style={{ fontSize: 13.5, color: '#6B7280' }}>
              {selectedDate ? 'Оберіть інший день або додайте новий слот' : 'Додайте слоти, щоб клієнти могли бронювати'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {groups.map(group => (
              <div key={group.dateLabel}>
                <h3 style={{
                  margin: '0 0 10px', fontSize: 12.5, fontWeight: 700,
                  color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  {group.dateLabel}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {group.items.map((slot, idx) => (
                    <SlotCard key={slot.id} slot={slot} index={idx + 1} onUpdate={onUpdateSlot} onDelete={onDeleteSlot} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
