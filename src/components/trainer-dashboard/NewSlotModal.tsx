import { useState, useEffect } from 'react';
import type { PostTrainerSlotPayload } from '../../services/trainerService';
import { SlotFormat } from '../../types';

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', border: '1px solid #D9DCE2', borderRadius: 9,
  fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: 'white',
  color: '#0F172A', width: '100%', boxSizing: 'border-box',
};
const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: 36,
  cursor: 'pointer',
};
const btnPrimary: React.CSSProperties = {
  padding: '10px 20px', background: 'var(--accent-600)', color: 'white',
  border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
};
const btnGhost: React.CSSProperties = {
  padding: '10px 20px', background: 'white', color: '#3F4651',
  border: '1.5px solid #E7E9EE', borderRadius: 9, fontSize: 14, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
};

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>{label}</label>
      {children}
    </div>
  );
}

function todayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Props {
  onClose: () => void;
  onSubmit: (payload: PostTrainerSlotPayload) => Promise<void>;
}

export default function NewSlotModal({ onClose, onSubmit }: Props) {
  const [date, setDate] = useState(todayDateStr());
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [format, setFormat] = useState<SlotFormat>(SlotFormat.Offline);
  const [price, setPrice] = useState('');
  const [maxClients, setMaxClients] = useState('1');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const toLocalISOString = (dateStr: string, timeStr: string): string => {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    const offset = -d.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const abs = Math.abs(offset);
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${sign}${hh}:${mm}`;
  };

  const handleSubmit = async () => {
    if (!date || !startTime || !endTime || !price || !maxClients) {
      setError("Заповніть усі обов'язкові поля");
      return;
    }
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);
    if (start < new Date()) {
      setError('Не можна створити слот у минулому');
      return;
    }
    if (end <= start) {
      setError('Час завершення має бути пізніше початку');
      return;
    }
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (durationHours > 6) {
      setError('Тривалість слоту не може перевищувати 6 годин');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Введіть коректну ціну');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        startTime: toLocalISOString(date, startTime),
        endTime: toLocalISOString(date, endTime),
        format,
        pricePerSession: priceNum,
        maxClients: parseInt(maxClients, 10),
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка створення слоту');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{
        background: 'white', borderRadius: 16, width: '100%', maxWidth: 560,
        boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
        animation: 'modal-in 180ms ease',
      }}>
        <div style={{ padding: '24px 28px 0' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', fontFamily: 'var(--display)' }}>
            Новий слот
          </h2>
        </div>

        <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FieldLabel label="Дата">
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={inputStyle}
              />
            </FieldLabel>
            <FieldLabel label="Формат">
              <select
                value={format}
                onChange={e => setFormat(parseInt(e.target.value, 10) as SlotFormat)}
                style={selectStyle}
              >
                <option value={SlotFormat.Offline}>Офлайн</option>
                <option value={SlotFormat.Online}>Онлайн</option>
              </select>
            </FieldLabel>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FieldLabel label="Початок">
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                style={inputStyle}
              />
            </FieldLabel>
            <FieldLabel label="Кінець">
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                style={inputStyle}
              />
            </FieldLabel>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FieldLabel label="Вартість, грн">
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="600"
                style={inputStyle}
                min="0.01"
                step="0.01"
              />
            </FieldLabel>
            <FieldLabel label="Макс. клієнтів">
              <input
                type="number"
                value={maxClients}
                onChange={e => setMaxClients(e.target.value)}
                style={inputStyle}
                min="1"
                max="100"
              />
            </FieldLabel>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 8, fontSize: 13, color: '#B91C1C',
            }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '0 28px 24px' }}>
          <button onClick={onClose} style={btnGhost}>Скасувати</button>
          <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Збереження…' : 'Зберегти слот'}
          </button>
        </div>
      </div>
    </div>
  );
}
