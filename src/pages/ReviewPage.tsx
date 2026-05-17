import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { postReview, getBookingHistory } from '../services/clientService';
import type { BookingHistoryItem } from '../types';

function StarIcon({ filled, size = 22 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function formatDateUk(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

type PageState = 'loading' | 'form' | 'success' | 'already_reviewed' | 'error';

export default function ReviewPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isRestoring } = useAuthContext();

  const bookingId = params.get('bookingId') ?? '';

  const [pageState, setPageState] = useState<PageState>('loading');
  const [booking, setBooking] = useState<BookingHistoryItem | null>(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isRestoring) return;
    if (!isAuthenticated) {
      navigate('/auth', { replace: true });
      return;
    }
    if (!bookingId) {
      setPageState('error');
      setErrorMsg('Невірне посилання — bookingId відсутній.');
      return;
    }
    if (!user) return;

    getBookingHistory(user.id)
      .then(history => {
        const found = history.find(h => h.id === bookingId) ?? null;
        setBooking(found);
        if (!found) {
          setPageState('error');
          setErrorMsg('Заняття не знайдено або ви не є його учасником.');
        } else if (found.review !== null) {
          setPageState('already_reviewed');
        } else {
          setPageState('form');
        }
      })
      .catch(() => {
        setPageState('error');
        setErrorMsg('Не вдалося завантажити дані заняття.');
      });
  }, [isRestoring, isAuthenticated, bookingId, user, navigate]);

  const handleSubmit = async () => {
    if (rating < 1 || submitting) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await postReview(bookingId, rating, comment);
      setPageState('success');
    } catch (err) {
      if (err instanceof Error && err.message === 'ALREADY_REVIEWED') {
        setPageState('already_reviewed');
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Помилка при збереженні відгуку.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const container: React.CSSProperties = {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8F9FB',
    padding: '24px 16px',
  };

  const card: React.CSSProperties = {
    background: 'white',
    borderRadius: 18,
    border: '1px solid #E7E9EE',
    padding: '36px 32px',
    maxWidth: 480,
    width: '100%',
  };

  const btnPrimary: React.CSSProperties = {
    padding: '11px 22px',
    background: 'var(--accent-600)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    width: '100%',
  };

  const btnGhost: React.CSSProperties = {
    padding: '11px 22px',
    background: 'white',
    color: '#3F4651',
    border: '1.5px solid #E7E9EE',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    width: '100%',
    marginTop: 10,
  };

  if (pageState === 'loading') {
    return (
      <div style={container}>
        <div style={{ ...card, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
          Завантаження…
        </div>
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div style={container}>
        <div style={{ ...card, textAlign: 'center' }}>
          <p style={{ color: '#DC2626', fontSize: 14, marginBottom: 20 }}>{errorMsg}</p>
          <button onClick={() => navigate('/dashboard')} style={btnPrimary}>
            До кабінету
          </button>
        </div>
      </div>
    );
  }

  if (pageState === 'already_reviewed') {
    return (
      <div style={container}>
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#0F172A' }}>
            Відгук вже надіслано
          </h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
            Ви вже залишили відгук для цього заняття.
          </p>
          <button onClick={() => navigate('/dashboard')} style={btnPrimary}>
            До кабінету
          </button>
        </div>
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div style={container}>
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#0F172A' }}>
            Дякуємо за відгук!
          </h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
            Ваша оцінка допоможе іншим клієнтам зробити вибір.
          </p>
          <button onClick={() => navigate('/dashboard')} style={btnPrimary}>
            До кабінету
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#0F172A' }}>
          Залишити відгук
        </h2>
        {booking && (
          <p style={{ margin: '0 0 24px', fontSize: 13.5, color: '#6B7280' }}>
            {booking.trainerFullName} · {formatDateUk(booking.startTime)}
          </p>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
            Оцінка
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                style={{
                  background: 'none', border: 'none', padding: 4, cursor: 'pointer',
                  color: (hovered || rating) >= n ? '#F5A524' : '#D9DCE2',
                  transition: 'color 0.1s',
                }}
              >
                <StarIcon filled size={28} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Коментар (необов'язково)
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={2000}
            placeholder="Поділіться враженнями від заняття…"
            style={{
              width: '100%', minHeight: 100, padding: '10px 12px',
              border: '1.5px solid #D9DCE2', borderRadius: 10,
              fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
              outline: 'none', boxSizing: 'border-box',
              background: 'white', color: '#0F172A', lineHeight: 1.55,
            }}
          />
        </div>

        {errorMsg && (
          <p style={{ fontSize: 13.5, color: '#DC2626', marginBottom: 14 }}>{errorMsg}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={rating < 1 || submitting}
          style={{
            ...btnPrimary,
            opacity: rating >= 1 && !submitting ? 1 : 0.5,
            cursor: rating >= 1 && !submitting ? 'pointer' : 'not-allowed',
          }}
        >
          {submitting ? 'Збереження…' : 'Опублікувати відгук'}
        </button>
        <button onClick={() => navigate('/dashboard')} style={btnGhost}>
          Скасувати
        </button>
      </div>
    </div>
  );
}
