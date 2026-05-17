import type { UserAchievementsResponse } from '../../types';

function LockIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

const ACHIEVEMENT_COLORS: Record<number, string> = {
  1: '#10B981',
  2: '#F59E0B',
  3: '#3B82F6',
  4: '#8B5CF6',
  5: '#EC4899',
  6: '#14B8A6',
  7: '#F97316',
  8: '#6366F1',
};

function achievementColor(type: number): string {
  return ACHIEVEMENT_COLORS[type] ?? '#6B7280';
}

interface Props {
  data: UserAchievementsResponse | null;
  isLoading: boolean;
  error: string | null;
}

export default function AchievementsTab({ data, isLoading, error }: Props) {
  if (isLoading) {
    return (
      <div>
        <div style={{
          height: 80, borderRadius: 14, background: '#F8F9FB',
          border: '1px solid #E7E9EE', marginBottom: 18,
        }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} style={{ height: 160, borderRadius: 14, background: '#F8F9FB', border: '1px solid #E7E9EE' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'white', border: '1px solid #E7E9EE', borderRadius: 14,
        padding: '32px 24px', textAlign: 'center', color: '#DC2626', fontSize: 14,
      }}>
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { totalCount, earnedCount, achievements } = data;

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, var(--accent-50) 0%, white 100%)',
        border: '1px solid var(--accent-100)',
        borderRadius: 14, padding: '18px 22px', marginBottom: 18,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
      }}>
        <div>
          <h2 style={{
            margin: 0, fontSize: 17, fontWeight: 700, color: '#0F172A',
            letterSpacing: '-0.02em', fontFamily: 'var(--display)',
          }}>
            Прогрес досягнень
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#6B7280' }}>
            Отримано{' '}
            <strong style={{ color: 'var(--accent-700)' }}>{earnedCount}</strong>
            {' '}з {totalCount} досягнень
          </p>
        </div>
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ height: 8, background: '#E7E9EE', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%`,
              height: '100%',
              background: 'var(--accent-600)', borderRadius: 999, transition: 'width 300ms',
            }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {achievements.map(a => {
          const color = achievementColor(a.type);
          return (
            <div key={a.id} style={{
              background: a.isEarned ? 'white' : '#FAFBFC',
              border: `1px solid ${a.isEarned ? '#E7E9EE' : '#F1F2F4'}`,
              borderRadius: 14, padding: 18, textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
                background: a.isEarned
                  ? `linear-gradient(135deg, ${color}22, ${color}11)`
                  : '#F1F2F4',
                border: `2px solid ${a.isEarned ? color : '#E7E9EE'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                filter: a.isEarned ? 'none' : 'grayscale(100%)',
                opacity: a.isEarned ? 1 : 0.5,
              }}>
                <img
                  src={a.iconUrl}
                  alt={a.title}
                  style={{ width: 32, height: 32, objectFit: 'contain' }}
                />
                {!a.isEarned && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(248, 249, 251, 0.85)', borderRadius: '50%',
                    color: '#9CA3AF',
                  }}>
                    <LockIcon />
                  </div>
                )}
              </div>

              <div style={{
                fontSize: 14, fontWeight: 600,
                color: a.isEarned ? '#0F172A' : '#6B7280',
                marginBottom: 4,
              }}>
                {a.title}
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>
                {a.description}
              </div>

              {a.isEarned && (
                <div style={{
                  marginTop: 10, padding: '3px 9px', display: 'inline-block',
                  background: `${color}15`, color,
                  borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                }}>
                  Отримано
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
