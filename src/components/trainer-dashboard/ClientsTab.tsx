import { useState, useEffect } from 'react';
import type { TrainerClient, TrainerBooking } from '../../types';
import { SlotFormat, TagCategory } from '../../types';
import { getClientBookingsForTrainer } from '../../services/trainerService';
import DashAvatar from './DashAvatar';
import SessionNotes from '../SessionNotes';
import DisputeModal from '../dispute/DisputeModal';

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #E7E9EE', borderRadius: 14,
};

function formatDateUk(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function tagStyle(category: TagCategory): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center',
    padding: '3px 9px', fontSize: 12, fontWeight: 500,
    borderRadius: 999, lineHeight: 1.4, whiteSpace: 'nowrap',
    border: '1px solid transparent',
  };
  switch (category) {
    case TagCategory.Disability:
      return { ...base, background: '#ECFEFF', color: '#0E7490', borderColor: '#A5F3FC' };
    case TagCategory.Methodology:
      return { ...base, background: '#F5F3FF', color: '#6D28D9', borderColor: '#DDD6FE' };
    case TagCategory.Specialization:
    default:
      return { ...base, background: '#F1F2F4', color: '#3F4651' };
  }
}

function formatDateTimeUk(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

interface Props {
  clients: TrainerClient[];
  trainerId: string;
  currentUserId: string;
  isLoading: boolean;
  error: string | null;
}

export default function ClientsTab({ clients, trainerId, currentUserId, isLoading, error }: Props) {
  const [selected, setSelected] = useState<TrainerClient | null>(null);
  const [search, setSearch] = useState('');

  const [history, setHistory] = useState<TrainerBooking[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [disputeFor, setDisputeFor] = useState<TrainerBooking | null>(null);

  useEffect(() => {
    if (!selected) return;
    setHistoryLoading(true);
    setHistoryError(null);
    setHistory([]);
    getClientBookingsForTrainer(trainerId, selected.clientId)
      .then(data =>
        setHistory(data.sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime())),
      )
      .catch(e => setHistoryError(e instanceof Error ? e.message : 'Помилка завантаження'))
      .finally(() => setHistoryLoading(false));
  }, [selected, trainerId]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ height: 64, background: '#F8F9FB', borderRadius: 10 }} />
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

  const filtered = clients.filter(c =>
    c.clientFullName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {disputeFor && selected && (
        <DisputeModal
          bookingId={disputeFor.id}
          contextLabel={`Клієнт: ${selected.clientFullName} · ${formatDateTimeUk(disputeFor.startDateTime)}`}
          onClose={() => setDisputeFor(null)}
        />
      )}

      {/* ── Left: client list ── */}
      <div style={{
        width: 280, flexShrink: 0,
        position: 'sticky', top: 80,
        maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 4 }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx={11} cy={11} r={7} /><line x1={20} y1={20} x2={15.5} y2={15.5} />
            </svg>
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Пошук клієнта…"
            style={{
              width: '100%', padding: '9px 12px 9px 34px', borderRadius: 9,
              border: '1px solid #E7E9EE', background: 'white', color: '#0F172A',
              fontSize: 13.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {filtered.length === 0 ? (
          <p style={{ margin: '16px 4px 0', fontSize: 13, color: '#9CA3AF' }}>
            {search ? 'Нікого не знайдено' : 'Немає клієнтів'}
          </p>
        ) : (
          filtered.map(c => {
            const sel = selected?.clientId === c.clientId;
            return (
              <button
                key={c.clientId}
                onClick={() => setSelected(sel ? null : c)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                  background: sel ? 'var(--accent-50)' : 'white',
                  border: sel ? '1.5px solid var(--accent-200)' : '1px solid #E7E9EE',
                  textAlign: 'left', fontFamily: 'inherit', transition: 'all 100ms',
                  width: '100%',
                }}
              >
                <DashAvatar name={c.clientFullName} size={40} avatarUrl={c.clientAvatarUrl} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: 13.5, fontWeight: 600, color: sel ? 'var(--accent-700)' : '#0F172A',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    letterSpacing: '-0.01em',
                  }}>
                    {c.clientFullName}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 1 }}>
                    {c.numOfClasses} занять · {formatDateUk(c.lastSlotDate)}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* ── Right: detail panel ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {!selected ? (
          <div style={{
            ...card, padding: '60px 24px', textAlign: 'center',
            border: '1px dashed #D9DCE2',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👈</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>
              Оберіть клієнта
            </div>
            <div style={{ fontSize: 13.5, color: '#6B7280' }}>
              Виберіть клієнта зліва, щоб переглянути історію занять та нотатки
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Client header */}
            <div style={{ ...card, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
              <DashAvatar name={selected.clientFullName} size={64} avatarUrl={selected.clientAvatarUrl} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 20, fontWeight: 700, color: '#0F172A',
                  letterSpacing: '-0.025em', fontFamily: 'var(--display)',
                }}>
                  {selected.clientFullName}
                </div>
                <div style={{ display: 'flex', gap: 20, marginTop: 6, fontSize: 13.5, color: '#6B7280', flexWrap: 'wrap' }}>
                  <span>
                    <strong style={{ color: '#0F172A', fontFamily: 'var(--display)' }}>{selected.numOfClasses}</strong> занять
                  </span>
                  <span>Останнє: {formatDateUk(selected.lastSlotDate)}</span>
                </div>
                {selected.tags && selected.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {selected.tags.map(tag => (
                      <span key={tag.id} style={tagStyle(tag.category)} title={tag.description ?? undefined}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Session history */}
            <div>
              <div style={{
                fontSize: 12, fontWeight: 700, color: '#6B7280',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                marginBottom: 12,
              }}>
                Історія занять{!historyLoading && history.length > 0 ? ` · ${history.length}` : ''}
              </div>

              {historyLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: 88, background: '#F8F9FB', borderRadius: 14 }} />
                  ))}
                </div>
              )}

              {!historyLoading && historyError && (
                <div style={{ ...card, padding: '20px 24px', color: '#DC2626', fontSize: 13.5 }}>
                  {historyError}
                </div>
              )}

              {!historyLoading && !historyError && history.length === 0 && (
                <div style={{ ...card, padding: '40px 24px', textAlign: 'center', border: '1px dashed #D9DCE2' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                    Завершених занять немає
                  </div>
                  <div style={{ fontSize: 13, color: '#9CA3AF' }}>
                    Тут з'являться заняття після їх завершення
                  </div>
                </div>
              )}

              {!historyLoading && !historyError && history.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {history.map(b => (
                    <div key={b.id} style={{ ...card, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 14.5, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em' }}>
                            {formatDateTimeUk(b.startDateTime)}
                          </div>
                          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>
                            {b.durationInMinutes} хв · {b.format === SlotFormat.Online ? 'Онлайн' : 'Офлайн'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{
                            fontSize: 12, fontWeight: 600, padding: '3px 10px',
                            background: '#F0F9FF', color: '#0369A1', borderRadius: 999,
                            border: '1px solid #BAE6FD', whiteSpace: 'nowrap',
                          }}>
                            Завершено
                          </span>
                          <button
                            onClick={() => setDisputeFor(b)}
                            style={{
                              padding: '6px 12px', background: 'white', color: '#3F4651',
                              border: '1.5px solid #E7E9EE', borderRadius: 9,
                              fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Відкрити спір
                          </button>
                        </div>
                      </div>
                      <SessionNotes bookingId={b.id} currentUserId={currentUserId} />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
