import { useState } from 'react';
import type { TrainerStep4SlotForm } from '../../../hooks/useTrainerOnboarding';
import type { TrainerSlotResponse } from '../../../services/trainerService';
import { SlotFormat } from '../../../types';
import SelectInput from '../SelectInput';
import Icon from '../../ui/Icon';

const FORMAT_OPTIONS = [
  { value: String(SlotFormat.Offline), label: 'Офлайн' },
  { value: String(SlotFormat.Online), label: 'Онлайн' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #D9DCE2',
  fontSize: 14, color: '#0F172A', fontFamily: 'inherit', background: 'white',
  outline: 'none', boxSizing: 'border-box',
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_SLOT: TrainerStep4SlotForm = {
  date: today(),
  startTime: '10:00',
  endTime: '11:00',
  format: SlotFormat.Offline,
  pricePerSession: '600',
  maxClients: '1',
};

interface TrainerStepFourProps {
  addedSlots: TrainerSlotResponse[];
  onSubmitSlot: (slot: TrainerStep4SlotForm) => Promise<boolean>;
  onFinish: () => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export default function TrainerStepFour({
  addedSlots, onSubmitSlot, onFinish, onBack, isLoading, error, onClearError,
}: TrainerStepFourProps) {
  const [showForm, setShowForm] = useState(false);
  const [slot, setSlot] = useState<TrainerStep4SlotForm>(EMPTY_SLOT);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateSlot = (): string | null => {
    const slotStart = new Date(`${slot.date}T${slot.startTime}`);
    const slotEnd = new Date(`${slot.date}T${slot.endTime}`);

    if (slotStart <= new Date()) {
      return 'Слот повинен бути в майбутньому. Оберіть дату та час, які ще не настали.';
    }
    const durationMinutes = (slotEnd.getTime() - slotStart.getTime()) / 60000;
    if (durationMinutes < 60) {
      return 'Тривалість слоту повинна бути не менше 60 хвилин. Перевірте час початку та кінця.';
    }
    return null;
  };

  const handleSaveSlot = async () => {
    const validationError = validateSlot();
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    const ok = await onSubmitSlot(slot);
    if (ok) {
      setSlot(EMPTY_SLOT);
      setShowForm(false);
    }
  };

  const formatLabel = (format: SlotFormat) =>
    format === SlotFormat.Online ? 'Онлайн' : 'Офлайн';

  return (
    <>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.025em', fontFamily: 'var(--display)' }}>
          Перші слоти
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 14.5, color: '#6B7280', lineHeight: 1.55 }}>
          Додайте часові слоти, щоб клієнти могли записатись до вас одразу після верифікації
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {addedSlots.length === 0 && !showForm && (
          <div style={{
            padding: '44px 24px', textAlign: 'center',
            background: 'linear-gradient(135deg, var(--accent-50), white)',
            border: '1px dashed var(--accent-200)', borderRadius: 14,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: '0 auto 14px',
              background: 'var(--accent-600)', color: 'white',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon d="M8 2v4|M16 2v4|M3 10h18|M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" size={26} />
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0F172A', marginBottom: 4, fontFamily: 'var(--display)' }}>
              Ще немає слотів
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', maxWidth: 380, margin: '0 auto 16px', lineHeight: 1.55 }}>
              Додайте перші часові слоти, щоб клієнти могли записатись до вас. Ви зможете редагувати та додавати їх у будь-який момент.
            </div>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              style={{
                padding: '10px 20px', background: 'var(--accent-600)', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              + Додати перший слот
            </button>
          </div>
        )}

        {addedSlots.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {addedSlots.map((s, i) => (
              <div key={i} style={{
                padding: 14, borderRadius: 10, border: '1px solid #E7E9EE', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                    {s.startTime.slice(0, 10)} · {s.startTime.slice(11, 16)}–{s.endTime.slice(11, 16)}
                  </div>
                  <div style={{ display: 'inline-flex', gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--accent-50)', color: 'var(--accent-700)' }}>
                      {formatLabel(s.format)}
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#F1F2F4', color: '#3F4651' }}>
                      {s.price} грн
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#F1F2F4', color: '#3F4651' }}>
                      до {s.maxClients} клієнтів
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                style={{
                  padding: '10px 14px', background: 'white', color: 'var(--accent-700)',
                  border: '1.5px dashed var(--accent-200)', borderRadius: 10,
                  fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                + Додати ще один слот
              </button>
            )}
          </div>
        )}

        {showForm && (
          <div style={{ padding: 18, borderRadius: 12, background: '#FAFBFC', border: '1px solid #E7E9EE' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Новий слот</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Дата</label>
                <input type="date" value={slot.date} onChange={(e) => { onClearError(); setLocalError(null); setSlot((s) => ({ ...s, date: e.target.value })); }} style={inputStyle} />
              </div>
              <SelectInput
                label="Формат"
                value={String(slot.format)}
                onChange={(v) => setSlot((s) => ({ ...s, format: parseInt(v) as SlotFormat }))}
                options={FORMAT_OPTIONS}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Початок</label>
                <input type="time" value={slot.startTime} onChange={(e) => { onClearError(); setLocalError(null); setSlot((s) => ({ ...s, startTime: e.target.value })); }} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Кінець</label>
                <input type="time" value={slot.endTime} onChange={(e) => { onClearError(); setLocalError(null); setSlot((s) => ({ ...s, endTime: e.target.value })); }} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Вартість, грн</label>
                <input type="number" value={slot.pricePerSession} onChange={(e) => { onClearError(); setSlot((s) => ({ ...s, pricePerSession: e.target.value })); }} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Макс. клієнтів</label>
                <input type="number" value={slot.maxClients} min={1} onChange={(e) => { onClearError(); setSlot((s) => ({ ...s, maxClients: e.target.value })); }} style={inputStyle} />
              </div>
            </div>
            {localError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FCA5A5', fontSize: 13, color: '#DC2626', marginBottom: 10 }}>
                {localError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setLocalError(null); onClearError(); }}
                style={{
                  padding: '9px 16px', background: 'white', color: '#3F4651',
                  border: '1.5px solid #E7E9EE', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handleSaveSlot}
                disabled={isLoading}
                style={{
                  padding: '9px 18px', background: 'var(--accent-600)', color: 'white',
                  border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? 'Збереження…' : 'Зберегти слот'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FCA5A5', fontSize: 13, color: '#DC2626' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #EDEFF3' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '11px 18px', background: 'white', color: '#3F4651',
              border: '1.5px solid #E7E9EE', borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <Icon d="M15 6l-6 6 6 6" size={15} /> Назад
          </button>
          <button
            type="button"
            onClick={onFinish}
            style={{
              padding: '11px 22px', background: 'var(--accent-600)', color: 'white',
              border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 2px 8px var(--accent-shadow)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            Почати роботу
            <Icon d="M9 6l6 6-6 6" size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
