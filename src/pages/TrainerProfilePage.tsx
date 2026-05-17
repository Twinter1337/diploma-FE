import { useState, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useTrainerProfile } from '../hooks/useTrainerProfile';
import { VerificationStatus, SlotFormat, SlotStatus, UserRole } from '../types';
import type { TrainerAvailableSlot, TrainerProfileReview, ScheduleSlot, BookingTrainerSummary } from '../types';
import { postTrainerSlot } from '../services/trainerService';
import type { PostTrainerSlotPayload } from '../services/trainerService';
import Icon from '../components/ui/Icon';
import AppHeader from '../components/ui/AppHeader';
import NewSlotModal from '../components/trainer-dashboard/NewSlotModal';

// ── Helpers ──────────────────────────────────────────────────────────────────

function idToHue(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

function reviewerHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Group slots by local calendar date → Map<"YYYY-MM-DD", TrainerAvailableSlot[]>
function groupSlotsByDate(slots: TrainerAvailableSlot[]): Map<string, TrainerAvailableSlot[]> {
  const map = new Map<string, TrainerAvailableSlot[]>();
  for (const slot of slots) {
    const d = new Date(slot.startDateTime);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const list = map.get(key) ?? [];
    list.push(slot);
    map.set(key, list);
  }
  return map;
}

function slotTimeLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ── Icons ────────────────────────────────────────────────────────────────────

function StarIcon({ filled, size = 16 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.2 1.9 2.9-.3.8 2.8 2.6 1.4-1 2.7L20.5 13l-1 2.5 1 2.7-2.6 1.4-.8 2.8-2.9-.3L12 24l-2.2-1.9-2.9.3-.8-2.8-2.6-1.4 1-2.7L3.5 13l1-2.5-1-2.7 2.6-1.4.8-2.8 2.9.3L12 2z" />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Cover ─────────────────────────────────────────────────────────────────────

interface CoverProps {
  firstName: string;
  lastName: string;
  hue: number;
  avatarUrl: string | null;
  verificationStatus: VerificationStatus;
  isAccessible: boolean;
  specializationTags: Array<{ id: number; name: string }>;
  rating: number;
  numOfReviews: number;
  city: string | null;
  experienceYears: number;
  minPrice: number | null;
  onBook: () => void;
}

function Cover({ firstName, lastName, hue, avatarUrl, verificationStatus, isAccessible, specializationTags, rating, numOfReviews, city, experienceYears, minPrice, onBook }: CoverProps) {
  const [imgError, setImgError] = useState(false);
  const showGradient = !avatarUrl || imgError;
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = [firstName[0], lastName[0]].filter(Boolean).join('');
  const isVerified = verificationStatus === VerificationStatus.Verified;

  return (
    <div style={{ position: 'relative', marginTop: 0 }}>
      {/* Gradient backdrop */}
      <div style={{
        position: 'absolute', inset: 0, height: 280, overflow: 'hidden',
        background: `linear-gradient(135deg, hsl(${hue} 60% 55%), hsl(${(hue + 60) % 360} 55% 40%))`,
      }}>
        <div style={{
          position: 'absolute', inset: -40, filter: 'blur(80px)', opacity: 0.7,
          background: `radial-gradient(50% 60% at 20% 30%, hsl(${hue} 80% 65%), transparent),
                       radial-gradient(40% 50% at 80% 70%, hsl(${(hue + 80) % 360} 70% 55%), transparent),
                       radial-gradient(30% 40% at 60% 20%, white, transparent)`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.35) 100%)',
        }} />
      </div>

      {/* Breadcrumb */}
      <div style={{
        position: 'relative', maxWidth: 1280, margin: '0 auto',
        padding: '20px 32px 0', color: 'rgba(255,255,255,0.85)',
        fontSize: 13, display: 'inline-flex', gap: 8, alignItems: 'center',
      }}>
        <Link to="/search" style={{ color: 'inherit', textDecoration: 'none' }}>Тренери</Link>
        <span style={{ opacity: 0.6 }}>/</span>
        <span style={{ color: 'white' }}>{fullName}</span>
      </div>

      {/* Content */}
      <div style={{
        position: 'relative', maxWidth: 1280, margin: '0 auto',
        padding: '40px 32px 28px',
        display: 'grid', gridTemplateColumns: 'auto 1fr auto',
        gap: 28, alignItems: 'flex-end',
      }}>
        {/* Avatar */}
        <div style={{
          width: 168, height: 168, borderRadius: '50%',
          background: showGradient
            ? `linear-gradient(135deg, hsl(${hue} 60% 62%), hsl(${(hue + 35) % 360} 65% 45%))`
            : undefined,
          position: 'relative', overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '5px solid white',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
        }}>
          {showGradient ? (
            <>
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(120% 80% at 50% 110%, rgba(0,0,0,.25), transparent 60%),
                             radial-gradient(60% 50% at 30% 25%, rgba(255,255,255,.35), transparent 70%)`,
              }} />
              <span style={{
                color: 'white', fontWeight: 700, fontSize: 168 * 0.36,
                letterSpacing: '-0.02em', fontFamily: 'var(--display)',
                textShadow: '0 2px 12px rgba(0,0,0,.2)',
              }}>{initials}</span>
            </>
          ) : (
            <img
              src={avatarUrl!}
              alt={fullName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImgError(true)}
            />
          )}
        </div>

        {/* Info */}
        <div style={{ minWidth: 0, paddingBottom: 8 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            {isVerified && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 11px 5px 9px', borderRadius: 999,
                background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
                fontSize: 12.5, fontWeight: 600, color: 'var(--accent-700)',
              }}>
                <span style={{ color: 'var(--accent-600)', display: 'inline-flex' }}><VerifiedBadge /></span>
                Верифіковано
              </span>
            )}
            {isAccessible && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 11px 5px 9px', borderRadius: 999,
                background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
                fontSize: 12.5, fontWeight: 600, color: '#0F172A',
              }}>
                <Icon d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 13l-4 0-1-3-3 0 0 5 5 0 1 6M11 12a4 4 0 1 0 4 6" size={14} />
                Інклюзивний тренер
              </span>
            )}
          </div>

          <h1 style={{
            margin: 0, fontSize: 40, fontWeight: 700, color: 'white',
            letterSpacing: '-0.025em', fontFamily: 'var(--display)',
            lineHeight: 1.1, textShadow: '0 2px 16px rgba(0,0,0,0.15)',
          }}>{fullName}</h1>

          {specializationTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
              {specializationTags.map(s => (
                <span key={s.id} style={{
                  padding: '5px 12px', fontSize: 12.5, fontWeight: 500,
                  borderRadius: 999, background: 'rgba(255,255,255,0.95)',
                  color: '#0F172A', backdropFilter: 'blur(8px)',
                }}>{s.name}</span>
              ))}
            </div>
          )}

          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 16,
            color: 'rgba(255,255,255,0.95)', fontSize: 13.5,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#F5A524', display: 'inline-flex' }}><StarIcon filled size={15} /></span>
              <strong style={{ color: 'white', fontWeight: 600 }}>{rating.toFixed(1)}</strong>
              <span style={{ opacity: 0.85 }}>({numOfReviews} відгуків)</span>
            </span>
            {city && (
              <>
                <span style={{ opacity: 0.5 }}>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Icon d="M12 21s-7-7.5-7-13a7 7 0 1114 0c0 5.5-7 13-7 13z M12 11a2 2 0 100-4 2 2 0 000 4z" size={14} />
                  {city}
                </span>
              </>
            )}
            <span style={{ opacity: 0.5 }}>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon d="M12 8v4l3 2 M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={14} />
              {experienceYears} {experienceYears === 1 ? 'рік' : experienceYears < 5 ? 'роки' : 'років'} досвіду
            </span>
            {minPrice != null && (
              <>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>
                  від <strong style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{minPrice} грн</strong> / заняття
                </span>
              </>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ paddingBottom: 8 }}>
          <button
            type="button"
            onClick={onBook}
            style={{
              padding: '14px 26px', background: 'var(--accent-600)', color: 'white',
              border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 8px 24px var(--accent-shadow)',
              transition: 'all 160ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-700)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-600)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Записатись на заняття
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bio ───────────────────────────────────────────────────────────────────────

interface BioProps {
  bio: string | null;
  experienceYears: number;
  numOfCompletedClasses: number;
  numOfActiveClients: number;
  methodologyTags: Array<{ id: number; name: string }>;
}

function BioSection({ bio, experienceYears, numOfCompletedClasses, numOfActiveClients, methodologyTags }: BioProps) {
  const stats = [
    { label: 'Занять проведено', value: numOfCompletedClasses > 0 ? `${numOfCompletedClasses}+` : '—' },
    { label: 'Активних клієнтів', value: String(numOfActiveClients) },
    { label: 'Років досвіду', value: String(experienceYears) },
  ];

  return (
    <section style={{
      background: 'white', border: '1px solid #E7E9EE', borderRadius: 16, padding: 28,
    }}>
      <h2 style={sectionTitle}>Про тренера</h2>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        margin: '20px 0 24px', padding: '16px 18px',
        background: '#F8F9FB', borderRadius: 12,
      }}>
        {stats.map(s => (
          <div key={s.label}>
            <div style={{
              fontSize: 22, fontWeight: 700, color: '#0F172A',
              letterSpacing: '-0.02em', fontFamily: 'var(--display)',
            }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {bio && (
        <div style={{
          fontSize: 14.5, lineHeight: 1.65, color: '#3F4651',
          whiteSpace: 'pre-line',
        }}>{bio}</div>
      )}

      {methodologyTags.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0F172A', marginBottom: 10, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Методологія
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {methodologyTags.map(m => (
              <span key={m.id} style={{
                padding: '5px 11px', fontSize: 12.5, fontWeight: 500,
                borderRadius: 999, background: 'var(--accent-50)',
                color: 'var(--accent-700)', border: '1px solid var(--accent-100)',
              }}>{m.name}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Reviews ───────────────────────────────────────────────────────────────────

function ReviewsSection({ reviews, rating, numOfReviews }: { reviews: TrainerProfileReview[]; rating: number; numOfReviews: number }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? reviews : reviews.slice(0, 3);

  return (
    <section style={{
      background: 'white', border: '1px solid #E7E9EE', borderRadius: 16, padding: 28,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <h2 style={sectionTitle}>Відгуки клієнтів</h2>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'inline-flex', color: '#F5A524' }}>
            {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled size={16} />)}
          </div>
          <strong style={{ fontSize: 16, color: '#0F172A', fontWeight: 700 }}>{rating.toFixed(1)}</strong>
          <span style={{ fontSize: 13, color: '#6B7280' }}>· {numOfReviews} відгуків</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div style={{ fontSize: 14, color: '#6B7280', padding: '16px 0' }}>
          Відгуків поки немає
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {visible.map((r, idx) => {
              const hue = reviewerHue(r.fullName);
              const initials = r.fullName.split(' ').map(p => p[0]).slice(0, 2).join('');
              return (
                <div key={idx} style={{
                  padding: '18px 20px', background: '#FAFBFC',
                  border: '1px solid #EDEFF3', borderRadius: 12,
                }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: r.comment ? 10 : 0, alignItems: 'center' }}>
                    {r.avatarUrl ? (
                      <img src={r.avatarUrl} alt={r.fullName} style={{
                        width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
                      }} />
                    ) : (
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, hsl(${hue} 55% 62%), hsl(${(hue + 35) % 360} 65% 45%))`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 600, fontSize: 16,
                        fontFamily: 'var(--display)',
                      }}>{initials}</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{r.fullName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <div style={{ display: 'inline-flex', color: '#F5A524' }}>
                          {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={r.rating >= i} size={12} />)}
                        </div>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>· {formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#3F4651' }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {!showAll && reviews.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              style={{
                marginTop: 16, width: '100%', padding: '11px 16px',
                background: 'white', color: 'var(--accent-700)',
                border: '1.5px solid var(--accent-200)', borderRadius: 10,
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 120ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-50)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
            >
              Показати більше відгуків ({reviews.length - 3})
            </button>
          )}
        </>
      )}
    </section>
  );
}

// ── Booking Calendar ──────────────────────────────────────────────────────────

const navBtnStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8,
  background: 'white', border: '1px solid #E7E9EE',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: '#3F4651', fontFamily: 'inherit',
};

interface BookingCalendarProps {
  slots: TrainerAvailableSlot[];
  minPrice: number | null;
  onBook: (slot: TrainerAvailableSlot) => void;
}

function BookingCalendar({ slots, minPrice, onBook }: BookingCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TrainerAvailableSlot | null>(null);

  const slotsByDate = useMemo(() => groupSlotsByDate(slots), [slots]);

  const grid = useMemo(() => {
    const first = new Date(month);
    const startDay = (first.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [month]);

  const isToday = (d: number) =>
    d === today.getDate() && month.getMonth() === today.getMonth() && month.getFullYear() === today.getFullYear();

  const monthName = month.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
  const monthShort = month.toLocaleDateString('uk-UA', { month: 'long' });

  const slotsForSelected = selectedDateKey ? (slotsByDate.get(selectedDateKey) ?? []) : [];

  const navMonth = (delta: number) => {
    const next = new Date(month);
    next.setMonth(next.getMonth() + delta);
    setMonth(next);
    setSelectedDateKey(null);
    setSelectedSlot(null);
  };

  const handleDayClick = (d: number) => {
    const key = dateKey(month.getFullYear(), month.getMonth(), d);
    if (!slotsByDate.has(key)) return;
    setSelectedDateKey(key);
    setSelectedSlot(null);
  };

  return (
    <aside style={{
      background: 'white', border: '1px solid #E7E9EE', borderRadius: 16,
      padding: 22, position: 'sticky', top: 84, alignSelf: 'flex-start',
    }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ ...sectionTitle, fontSize: 17, marginBottom: 4 }}>Записатись на заняття</h2>
        {minPrice != null && (
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
            від <strong style={{ color: '#0F172A', fontWeight: 700 }}>{minPrice} грн</strong> / заняття
          </p>
        )}
      </div>

      {/* Month nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button type="button" onClick={() => navMonth(-1)} style={navBtnStyle}>
          <Icon d="M15 6l-6 6 6 6" size={16} />
        </button>
        <div style={{
          fontSize: 14, fontWeight: 600, color: '#0F172A',
          textTransform: 'capitalize', letterSpacing: '-0.01em',
        }}>{monthName}</div>
        <button type="button" onClick={() => navMonth(1)} style={navBtnStyle}>
          <Icon d="M9 6l6 6-6 6" size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2,
        fontSize: 11, fontWeight: 600, color: '#9CA3AF',
        textAlign: 'center', marginBottom: 4,
      }}>
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(d => <div key={d}>{d}</div>)}
      </div>

      {/* Days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {grid.map((d, i) => {
          if (d === null) return <div key={i} />;
          const key = dateKey(month.getFullYear(), month.getMonth(), d);
          const available = slotsByDate.has(key);
          const selected = selectedDateKey === key;
          const isCurrent = isToday(d);
          return (
            <button
              key={i}
              type="button"
              disabled={!available}
              onClick={() => handleDayClick(d)}
              style={{
                aspectRatio: '1 / 1', borderRadius: 8,
                background: selected ? 'var(--accent-600)' : available ? 'var(--accent-50)' : 'transparent',
                color: selected ? 'white' : available ? 'var(--accent-700)' : '#C4C8D0',
                border: isCurrent && !selected ? '1.5px solid var(--accent-600)' : '1.5px solid transparent',
                fontSize: 13, fontWeight: available ? 600 : 400,
                cursor: available ? 'pointer' : 'default',
                fontFamily: 'inherit', transition: 'all 120ms',
              }}
              onMouseEnter={e => { if (available && !selected) e.currentTarget.style.background = 'var(--accent-100)'; }}
              onMouseLeave={e => { if (available && !selected) e.currentTarget.style.background = 'var(--accent-50)'; }}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 14, marginTop: 14, fontSize: 11.5, color: '#6B7280',
        paddingTop: 12, borderTop: '1px solid #EDEFF3',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent-50)', border: '1px solid var(--accent-100)', display: 'block' }} />
          Доступно
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent-600)', display: 'block' }} />
          Обрано
        </span>
      </div>

      {/* Time slots */}
      {selectedDateKey && (
        <div style={{ marginTop: 18 }}>
          <div style={{
            fontSize: 12.5, fontWeight: 600, color: '#0F172A', marginBottom: 10,
            letterSpacing: '0.02em', textTransform: 'uppercase',
          }}>
            {`Час · ${new Date(selectedDateKey).getDate()} ${monthShort}`}
          </div>
          {slotsForSelected.length === 0 ? (
            <div style={{ fontSize: 13, color: '#6B7280', padding: '12px 0' }}>
              На цей день вільних годин немає
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {slotsForSelected.map((slot, idx) => {
                const sel = selectedSlot === slot;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: '9px 8px', borderRadius: 8,
                      background: sel ? 'var(--accent-600)' : 'white',
                      color: sel ? 'white' : '#0F172A',
                      border: `1.5px solid ${sel ? 'var(--accent-600)' : '#E7E9EE'}`,
                      fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 120ms',
                    }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--accent-200)'; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = '#E7E9EE'; }}
                  >
                    {slotTimeLabel(slot.startDateTime)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary + CTA */}
      <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #EDEFF3' }}>
        {selectedSlot && (
          <div style={{
            background: 'var(--accent-50)', borderRadius: 12, padding: '14px 16px',
            marginBottom: 12, fontSize: 13, color: 'var(--accent-700)',
            border: '1px solid var(--accent-100)',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {new Date(selectedSlot.startDateTime).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })} о {slotTimeLabel(selectedSlot.startDateTime)}
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.85 }}>
              {selectedSlot.durationInMinutes} хв · {selectedSlot.price} грн
            </div>
            {selectedSlot.description && (
              <div style={{ fontSize: 12.5, color: 'var(--accent-800)', lineHeight: 1.5, paddingTop: 2, borderTop: '1px solid var(--accent-100)' }}>
                {selectedSlot.description}
              </div>
            )}
            {(selectedSlot.gymName || selectedSlot.gymAddress) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12.5, paddingTop: selectedSlot.description ? 0 : 2, borderTop: selectedSlot.description ? 'none' : '1px solid var(--accent-100)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div>
                  {selectedSlot.gymName && <div style={{ fontWeight: 600 }}>{selectedSlot.gymName}</div>}
                  {selectedSlot.gymAddress && <div style={{ opacity: 0.8 }}>{selectedSlot.gymAddress}</div>}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => selectedSlot && onBook(selectedSlot)}
          disabled={!selectedSlot}
          style={{
            width: '100%', padding: '13px 16px',
            background: selectedSlot ? 'var(--accent-600)' : '#E7E9EE',
            color: selectedSlot ? 'white' : '#9CA3AF',
            border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 600,
            cursor: selectedSlot ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            boxShadow: selectedSlot ? '0 4px 12px var(--accent-shadow)' : 'none',
            transition: 'all 160ms',
          }}
        >
          {selectedSlot ? 'Забронювати' : 'Оберіть дату та час'}
        </button>

        <p style={{
          margin: '10px 0 0', fontSize: 11.5, color: '#9CA3AF',
          textAlign: 'center', lineHeight: 1.5,
        }}>
          Безкоштовне скасування за 24 години до заняття
        </p>
      </div>
    </aside>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const sectionTitle: React.CSSProperties = {
  margin: 0, fontSize: 19, fontWeight: 700, color: '#0F172A',
  letterSpacing: '-0.02em', fontFamily: 'var(--display)',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TrainerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { profile, slots, reviews, isLoading, error, refetchSlots } = useTrainerProfile(id ?? '');
  const calendarRef = useRef<HTMLDivElement>(null);
  const [showCreateSlot, setShowCreateSlot] = useState(false);

  const isOwner = user?.id === id && user?.role === UserRole.Trainer;

  const handleCreateSlot = useCallback(async (payload: PostTrainerSlotPayload) => {
    if (!id) throw new Error('Не авторизовано');
    await postTrainerSlot(id, payload);
    await refetchSlots();
  }, [id, refetchSlots]);

  const hue = useMemo(() => idToHue(id ?? ''), [id]);

  const minPrice = useMemo<number | null>(() => {
    if (slots.length === 0) return null;
    const now = Date.now();
    const upcoming = slots.filter(s => new Date(s.startDateTime).getTime() > now);
    if (upcoming.length === 0) return null;
    return Math.min(...upcoming.map(s => s.price));
  }, [slots]);

  const scrollToCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBook = (availableSlot: TrainerAvailableSlot) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const endTime = new Date(
      new Date(availableSlot.startDateTime).getTime() + availableSlot.durationInMinutes * 60_000,
    ).toISOString();
    const slot: ScheduleSlot = {
      id: availableSlot.id,
      trainerId: id!,
      startTime: availableSlot.startDateTime,
      endTime,
      format: SlotFormat.Online,
      price: availableSlot.price,
      maxClients: 1,
      description: null,
      gymName: null,
      gymAddress: null,
      status: SlotStatus.Available,
      createdAt: availableSlot.startDateTime,
    };
    const trainer: BookingTrainerSummary = {
      firstName: profile!.firstName,
      lastName: profile!.lastName,
      specializations: profile!.specializationTags.map(t => t.name),
      rating: profile!.rating,
    };
    navigate('/booking/confirm', { state: { slot, trainer } });
  };

  if (isLoading) {
    return (
      <div style={{ background: '#F8F9FB', minHeight: '100vh' }}>
        <AppHeader />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 'calc(100vh - 65px)',
        }}>
          <div style={{ fontSize: 15, color: '#6B7280' }}>Завантаження...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ background: '#F8F9FB', minHeight: '100vh' }}>
        <AppHeader />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: 'calc(100vh - 65px)', gap: 16,
        }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A' }}>
            {error?.toLowerCase().includes('not found') || error?.includes('не знайдено') ? 'Тренера не знайдено' : 'Сталася помилка'}
          </div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>
            {error?.toLowerCase().includes('not found') || error?.includes('не знайдено')
              ? 'Перевірте посилання або оберіть тренера зі списку.'
              : 'Не вдалося завантажити профіль тренера. Спробуйте ще раз.'}
          </div>
          <button
            type="button"
            onClick={() => navigate('/search')}
            style={{
              padding: '10px 20px', background: 'var(--accent-600)', color: 'white',
              border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >Повернутись до пошуку</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh' }}>
      <AppHeader />

      <Cover
        firstName={profile.firstName}
        lastName={profile.lastName}
        hue={hue}
        avatarUrl={profile.avatarUrl}
        verificationStatus={profile.verificationStatus}
        isAccessible={profile.isAccessible}
        specializationTags={profile.specializationTags}
        rating={profile.rating}
        numOfReviews={profile.numOfReviews}
        city={profile.city}
        experienceYears={profile.experienceYears}
        minPrice={minPrice}
        onBook={scrollToCalendar}
      />

      <main style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '32px 32px 64px',
        display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28,
        alignItems: 'flex-start',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <BioSection
            bio={profile.bio}
            experienceYears={profile.experienceYears}
            numOfCompletedClasses={profile.numOfCompletedClasses}
            numOfActiveClients={profile.numOfActiveClients}
            methodologyTags={profile.methodologyTags}
          />
          <ReviewsSection
            reviews={reviews}
            rating={profile.rating}
            numOfReviews={profile.numOfReviews}
          />
        </div>

        <div ref={calendarRef} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isOwner && (
            <button
              type="button"
              onClick={() => setShowCreateSlot(true)}
              style={{
                width: '100%', padding: '11px 16px',
                background: 'var(--accent-600)', color: 'white',
                border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <line x1={12} y1={5} x2={12} y2={19} /><line x1={5} y1={12} x2={19} y2={12} />
              </svg>
              Новий слот
            </button>
          )}
          <BookingCalendar
            slots={slots}
            minPrice={minPrice}
            onBook={handleBook}
          />
        </div>
      </main>

      {showCreateSlot && (
        <NewSlotModal
          onClose={() => setShowCreateSlot(false)}
          onSubmit={handleCreateSlot}
        />
      )}
    </div>
  );
}
