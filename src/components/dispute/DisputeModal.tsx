import { useEffect, useState } from 'react';
import { useBookingTicket } from '../../hooks/useBookingTicket';

const SUBJECT_MAX = 200;
const DESCRIPTION_MAX = 2000;

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', border: '1px solid #D9DCE2', borderRadius: 9,
  fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: 'white',
  color: '#0F172A', width: '100%', boxSizing: 'border-box',
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

interface Props {
  bookingId: string;
  contextLabel?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DisputeModal({ bookingId, contextLabel, onClose, onSuccess }: Props) {
  const { submit, isSubmitting, error } = useBookingTicket();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const trimmedSubject = subject.trim();
  const trimmedDescription = description.trim();
  const canSubmit = trimmedSubject.length > 0 && trimmedDescription.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    setLocalError(null);
    if (!trimmedSubject || !trimmedDescription) {
      setLocalError("Заповніть тему та опис.");
      return;
    }
    if (trimmedSubject.length > SUBJECT_MAX) {
      setLocalError(`Тема не може перевищувати ${SUBJECT_MAX} символів.`);
      return;
    }
    if (trimmedDescription.length > DESCRIPTION_MAX) {
      setLocalError(`Опис не може перевищувати ${DESCRIPTION_MAX} символів.`);
      return;
    }
    const result = await submit(bookingId, trimmedSubject, trimmedDescription);
    if (result) {
      setSubmitted(true);
      onSuccess?.();
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
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
          <h2 style={{
            margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A',
            letterSpacing: '-0.02em', fontFamily: 'var(--display)',
          }}>
            Відкрити спір
          </h2>
          {contextLabel && (
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6B7280' }}>
              {contextLabel}
            </p>
          )}
        </div>

        {submitted ? (
          <>
            <div style={{ padding: '20px 28px' }}>
              <div style={{
                padding: '14px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0',
                borderRadius: 10, fontSize: 13.5, color: '#065F46', lineHeight: 1.5,
              }}>
                <strong>Звернення відправлено.</strong> Команда підтримки зв'яжеться з вами найближчим часом.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '0 28px 24px' }}>
              <button onClick={onClose} style={btnPrimary}>Готово</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
                  Тема
                </label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  maxLength={SUBJECT_MAX}
                  placeholder="Коротко опишіть проблему"
                  style={inputStyle}
                />
                <div style={{ alignSelf: 'flex-end', fontSize: 11.5, color: '#9CA3AF' }}>
                  {subject.length}/{SUBJECT_MAX}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>
                  Опис
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={DESCRIPTION_MAX}
                  placeholder="Опишіть детально, що сталось…"
                  rows={6}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                />
                <div style={{ alignSelf: 'flex-end', fontSize: 11.5, color: '#9CA3AF' }}>
                  {description.length}/{DESCRIPTION_MAX}
                </div>
              </div>

              {(localError || error) && (
                <div style={{
                  padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: 8, fontSize: 13, color: '#B91C1C',
                }}>
                  {localError || error}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '0 28px 24px' }}>
              <button onClick={onClose} style={btnGhost} disabled={isSubmitting}>
                Скасувати
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{ ...btnPrimary, opacity: canSubmit ? 1 : 0.6, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
              >
                {isSubmitting ? 'Відправлення…' : 'Відправити'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
