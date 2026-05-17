import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingStatus } from '../../types';
import type { BookingHistoryItem } from '../../types';
import SessionNotes from '../SessionNotes';
import DisputeModal from '../dispute/DisputeModal';

function nameHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % 360;
  return h;
}

function formatDateUk(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function TrainerAvatar({ name, size, avatarUrl }: { name: string; size: number; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  const hue = nameHue(name);
  const initials = name.split(' ').slice(0, 2).map(p => p[0]).join('');
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},70%,55%) 0%, hsl(${(hue + 40) % 360},65%,70%) 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: size * 0.3, fontWeight: 700,
    }}>
      {initials}
    </div>
  );
}

function StarIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x={3} y={4} width={18} height={18} rx={2} />
      <line x1={16} y1={2} x2={16} y2={6} />
      <line x1={8} y1={2} x2={8} y2={6} />
      <line x1={3} y1={10} x2={21} y2={10} />
    </svg>
  );
}

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #E7E9EE', borderRadius: 14, padding: 20,
};
const btnPrimary: React.CSSProperties = {
  padding: '9px 16px', background: 'var(--accent-600)', color: 'white',
  border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
};
const btnGhost: React.CSSProperties = {
  padding: '9px 16px', background: 'white', color: '#3F4651',
  border: '1.5px solid #E7E9EE', borderRadius: 9,
  fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};

interface Props {
  history: BookingHistoryItem[];
  isLoading: boolean;
  error: string | null;
  currentUserId: string;
  onSubmitReview: (bookingId: string, trainerFullName: string, rating: number, comment: string) => Promise<boolean>;
}

export default function HistoryTab({ history, isLoading, error, currentUserId, onSubmitReview }: Props) {
  const navigate = useNavigate();
  const [drafting, setDrafting] = useState<number | null>(null);
  const [draftRating, setDraftRating] = useState(0);
  const [draftText, setDraftText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [disputeFor, setDisputeFor] = useState<BookingHistoryItem | null>(null);

  const handleSubmit = async (idx: number, item: BookingHistoryItem) => {
    if (draftRating < 1) return;
    setSubmitting(true);
    const ok = await onSubmitReview(item.id, item.trainerFullName, draftRating, draftText);
    setSubmitting(false);
    if (ok) {
      setDrafting(null);
      setDraftRating(0);
      setDraftText('');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ ...card, height: 80, background: '#F8F9FB' }} />
        ))}
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

  if (history.length === 0) {
    return (
      <div style={{ ...card, padding: '60px 24px', textAlign: 'center', border: '1px dashed #D9DCE2' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>
          Немає завершених занять
        </div>
        <div style={{ fontSize: 13.5, color: '#6B7280', marginBottom: 18 }}>
          Після завершення заняття воно з'явиться тут
        </div>
        <button onClick={() => navigate('/search')} style={btnPrimary}>
          Знайти тренера
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {disputeFor && (
        <DisputeModal
          bookingId={disputeFor.id}
          contextLabel={`Тренер: ${disputeFor.trainerFullName} · ${formatDateUk(disputeFor.startTime)}`}
          onClose={() => setDisputeFor(null)}
        />
      )}
      {history.map((item, idx) => (
        <article key={idx} style={card}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'flex-start' }}>
            <TrainerAvatar name={item.trainerFullName} size={56} avatarUrl={item.trainerAvatarUrl} />

            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em' }}>
                {item.trainerFullName}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: '#6B7280', marginTop: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CalendarIcon />
                  {formatDateUk(item.startTime)}
                </span>
                <span style={{ color: '#0F172A', fontWeight: 600 }}>{item.price} грн</span>
              </div>

              {item.review && (
                <div style={{
                  marginTop: 12, padding: '12px 14px', background: '#FAFBFC',
                  borderRadius: 10, border: '1px solid #EDEFF3',
                }}>
                  <div style={{ display: 'inline-flex', color: '#F5A524', marginBottom: 6 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <StarIcon key={i} filled={item.review!.rating >= i} size={13} />
                    ))}
                  </div>
                  {item.review.comment && (
                    <p style={{ margin: 0, fontSize: 13.5, color: '#3F4651', lineHeight: 1.55 }}>
                      {item.review.comment}
                    </p>
                  )}
                </div>
              )}

              {drafting === idx && (
                <div style={{
                  marginTop: 12, padding: 14, background: 'var(--accent-50)',
                  borderRadius: 10, border: '1px solid var(--accent-100)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setDraftRating(n)} style={{
                        background: 'none', border: 'none', padding: 2, cursor: 'pointer',
                        color: draftRating >= n ? '#F5A524' : '#D9DCE2',
                      }}>
                        <StarIcon filled size={22} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={draftText}
                    onChange={e => setDraftText(e.target.value)}
                    placeholder="Поділіться враженнями від заняття…"
                    style={{
                      width: '100%', minHeight: 70, padding: 10,
                      border: '1px solid #D9DCE2', borderRadius: 8,
                      fontSize: 13.5, fontFamily: 'inherit', resize: 'vertical',
                      outline: 'none', boxSizing: 'border-box',
                      background: 'white', color: '#0F172A',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      onClick={() => handleSubmit(idx, item)}
                      disabled={!draftRating || submitting}
                      style={{
                        ...btnPrimary,
                        opacity: draftRating && !submitting ? 1 : 0.5,
                        cursor: draftRating && !submitting ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Опублікувати
                    </button>
                    <button onClick={() => { setDrafting(null); setDraftRating(0); setDraftText(''); }} style={btnGhost}>
                      Скасувати
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {!item.review && drafting !== idx && item.bookingStatus === BookingStatus.Completed && (
                <button onClick={() => { setDrafting(idx); setDraftRating(0); setDraftText(''); }} style={btnPrimary}>
                  Залишити відгук
                </button>
              )}
              {item.review && (
                <button onClick={() => navigate(`/trainer/${item.trainerId}`)} style={btnGhost}>
                  Записатись знову
                </button>
              )}
              <button onClick={() => setDisputeFor(item)} style={btnGhost}>
                Відкрити спір
              </button>
            </div>
          </div>
          <SessionNotes bookingId={item.id} currentUserId={currentUserId} />
        </article>
      ))}
    </div>
  );
}
