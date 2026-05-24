import type { TrainerStats, TrainerProfileReview } from '../../types';
import DashAvatar from './DashAvatar';
import { useIsMobile } from '../../hooks/useWindowWidth';

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #E7E9EE', borderRadius: 14,
};

const MONTH_NAMES_UK = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, color: '#F5A524' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={12} height={12} viewBox="0 0 24 24"
          fill={rating >= i ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function StatCard({ label, value, delta, icon, color }: {
  label: string; value: string; delta: string; icon: string; color: string;
}) {
  return (
    <div style={{ ...card, padding: 22 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, marginBottom: 14,
        background: `${color}18`, color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
      </div>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', fontFamily: 'var(--display)', lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--accent-700)', fontWeight: 600, marginTop: 8 }}>
        {delta}
      </div>
    </div>
  );
}

interface Props {
  stats: TrainerStats | null;
  reviews: TrainerProfileReview[];
  isLoading: boolean;
  error: string | null;
}

export default function StatsTab({ stats, reviews, isLoading, error }: Props) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ ...card, height: 140, background: '#F8F9FB' }} />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ ...card, padding: '32px 24px', textAlign: 'center', color: '#DC2626', fontSize: 14 }}>
        {error ?? 'Не вдалося завантажити статистику'}
      </div>
    );
  }

  const monthData = stats.completedSlotsPerMonth;
  const maxVal = Math.max(...monthData.map(m => m.numOfCompletedSlots), 1);
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
        <StatCard
          label="Завершених занять"
          value={String(stats.numOfCompletedSlots)}
          delta="За весь час"
          icon="M9 11H5a2 2 0 00-2 2v3a2 2 0 002 2h4M19 9h-4a2 2 0 00-2 2v7a2 2 0 002 2h4"
          color="#3B82F6"
        />
        <StatCard
          label="Середній рейтинг"
          value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
          delta={`${reviews.length} відгуків`}
          icon="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          color="#F59E0B"
        />
        <StatCard
          label="Активних клієнтів"
          value={String(stats.activeClientsThisMonth)}
          delta="Цього місяця"
          icon="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M13 7a4 4 0 11-8 0 4 4 0 018 0zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          color="#10B981"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: 20 }}>
        <section style={{ ...card, padding: 22 }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>Динаміка занять</div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
              Завершені заняття цього року
            </p>
          </div>

          {monthData.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>
              Немає даних
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 200, padding: '0 4px' }}>
              {monthData.map(m => {
                const isCurrentMonth = m.month === currentMonth;
                const h = maxVal > 0 ? (m.numOfCompletedSlots / maxVal) * 100 : 0;
                return (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: isCurrentMonth ? 'var(--accent-700)' : '#9CA3AF' }}>
                      {m.numOfCompletedSlots > 0 ? m.numOfCompletedSlots : ''}
                    </div>
                    <div style={{
                      width: '100%', height: `${Math.max(h, 4)}%`, minHeight: 6,
                      borderRadius: '6px 6px 3px 3px',
                      background: isCurrentMonth
                        ? 'linear-gradient(180deg, var(--accent-600), var(--accent-700))'
                        : 'linear-gradient(180deg, var(--accent-200), var(--accent-100))',
                      transition: 'height 300ms',
                    }} />
                    <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>
                      {MONTH_NAMES_UK[m.month - 1]}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section style={{ ...card, padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em', marginBottom: 16 }}>
            Останні відгуки
          </div>
          {reviews.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: '#9CA3AF', fontSize: 13 }}>
              Відгуків ще немає
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reviews.slice(0, 3).map((r, i) => (
                <div key={i} style={{
                  paddingBottom: 14,
                  borderBottom: i < Math.min(reviews.length, 3) - 1 ? '1px solid #EDEFF3' : 'none',
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                    <DashAvatar name={r.fullName} size={32} avatarUrl={r.avatarUrl} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{r.fullName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <StarRating rating={r.rating} />
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                          {new Date(r.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ margin: 0, fontSize: 12.5, color: '#3F4651', lineHeight: 1.55 }}>{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
