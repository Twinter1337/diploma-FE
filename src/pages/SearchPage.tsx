import { useLocation } from 'react-router-dom';
import { useTrainerSearch } from '../hooks/useTrainerSearch';
import type { SortOption } from '../hooks/useTrainerSearch';
import { useStats } from '../hooks/useStats';
import FilterPanel from '../components/search/FilterPanel';
import TrainerCard from '../components/search/TrainerCard';
import Icon from '../components/ui/Icon';
import AppHeader from '../components/ui/AppHeader';

// ── Sort pill ────────────────────────────────────────────────────────────────

function SortPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '6px 12px', borderRadius: 8,
      background: active ? 'var(--accent-50)' : 'white',
      color: active ? 'var(--accent-700)' : '#3F4651',
      border: `1px solid ${active ? 'var(--accent-200)' : '#E7E9EE'}`,
      fontSize: 13, fontWeight: active ? 600 : 500,
      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 120ms',
    }}>{label}</button>
  );
}

// ── Page btn ─────────────────────────────────────────────────────────────────

function PageBtn({ children, active, disabled, onClick }: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{
      minWidth: 36, height: 36, padding: '0 10px',
      borderRadius: 9, border: `1px solid ${active ? 'var(--accent-600)' : '#E7E9EE'}`,
      background: active ? 'var(--accent-600)' : 'white',
      color: active ? 'white' : '#3F4651',
      fontSize: 13.5, fontWeight: active ? 600 : 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'inherit', transition: 'all 150ms',
    }}
      onMouseEnter={e => { if (!disabled && !active) { e.currentTarget.style.borderColor = 'var(--accent-200)'; e.currentTarget.style.color = 'var(--accent-700)'; } }}
      onMouseLeave={e => { if (!disabled && !active) { e.currentTarget.style.borderColor = '#E7E9EE'; e.currentTarget.style.color = '#3F4651'; } }}
    >{children}</button>
  );
}

// ── Active filter chip ────────────────────────────────────────────────────────

const chip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '5px 6px 5px 11px', fontSize: 12.5, fontWeight: 500,
  background: 'var(--accent-50)', color: 'var(--accent-700)',
  border: '1px solid var(--accent-100)', borderRadius: 999,
};
const chipX: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 18, height: 18, borderRadius: 999,
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: 'var(--accent-700)', padding: 0, transition: 'background 150ms',
};

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar({ totalCount }: { totalCount: number }) {
  const { stats, isLoading } = useStats();

  const statDivider = (
    <div style={{ width: 1, background: '#E7E9EE', alignSelf: 'stretch', margin: '0 2px' }} />
  );

  const cell = (label: string, icon: React.ReactNode, value: React.ReactNode) => (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      padding: '10px 20px', gap: 2,
    }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon}
        <span style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', fontFamily: 'var(--display)', letterSpacing: '-0.02em' }}>
          {value}
        </span>
      </div>
    </div>
  );

  const skeleton = (
    <div style={{
      width: '100%', height: 58,
      background: 'white', border: '1px solid #E7E9EE', borderRadius: 12,
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  );

  if (isLoading) return skeleton;
  if (!stats) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', width: '100%',
      background: 'white', border: '1px solid #E7E9EE', borderRadius: 12,
      boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
      overflow: 'hidden',
    }}>
      {cell(
        'Середній рейтинг',
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
        stats.avgRating.toFixed(1),
      )}
      {statDivider}
      {cell(
        'Середня ціна',
        <span style={{ fontSize: 13, fontWeight: 700, color: '#6B7280' }}>₴</span>,
        `${Math.round(stats.avgPrice)} грн`,
      )}
      {statDivider}
      {cell(
        'Міст',
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-600)' }} />,
        stats.numOfCities,
      )}
      {statDivider}
      {cell(
        'Верифіковано',
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
        `${stats.numOfVerified}/${totalCount}`,
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const { state } = useLocation();
  const initialCity = (state as { city?: string } | null)?.city ?? '';

  const {
    filters, setFilters,
    appliedFilters, setAppliedFilters,
    sort, setSort,
    page, setPage,
    result, isLoading, error,
    specializationTags, disabilityTags, methodologyTags,
    tagsLoading, tagsError, fetchTags,
    applyFilters, resetFilters,
    activeFilterCount,
  } = useTrainerSearch(initialCity);

  const totalCount = result?.totalCount ?? 0;
  const totalPages = result?.totalPages ?? 1;
  const trainers = result?.items ?? [];

  const removeSpecTag = (id: number) => {
    const next = { ...appliedFilters, specializationTagIds: appliedFilters.specializationTagIds.filter(x => x !== id) };
    setAppliedFilters(next);
    setFilters(() => next);
  };

  const removeCity = () => {
    const next = { ...appliedFilters, city: '' };
    setAppliedFilters(next);
    setFilters(() => next);
  };

  const removeAccess = () => {
    const next = { ...appliedFilters, isAccess: false, disabilityTagIds: [] };
    setAppliedFilters(next);
    setFilters(() => next);
  };

  const removeVerified = () => {
    const next = { ...appliedFilters, isVerified: false };
    setAppliedFilters(next);
    setFilters(() => next);
  };

  const removeMethodTag = (id: number) => {
    const next = { ...appliedFilters, methodologyTagIds: appliedFilters.methodologyTagIds.filter(x => x !== id) };
    setAppliedFilters(next);
    setFilters(() => next);
  };

  const specTagName = (id: number) =>
    specializationTags.find(t => t.id === id)?.name ?? String(id);

  const methodTagName = (id: number) =>
    methodologyTags.find(t => t.id === id)?.name ?? String(id);

  const pluralTrainers = (n: number) => {
    if (n % 10 === 1 && n % 100 !== 11) return 'тренер';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'тренери';
    return 'тренерів';
  };

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh' }}>
      <AppHeader />

      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 32px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22 }}>
          <div style={{ flexShrink: 0 }}>
            <h1 style={{
              margin: 0, fontSize: 28, fontWeight: 700, color: '#0F172A',
              letterSpacing: '-0.025em', fontFamily: 'var(--display)',
            }}>Знайдіть свого тренера</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14.5, color: '#6B7280' }}>
              {isLoading
                ? 'Пошук…'
                : `${totalCount} ${pluralTrainers(totalCount)} за вашими критеріями`}
            </p>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <StatsBar totalCount={totalCount} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onApply={applyFilters}
            onReset={resetFilters}
            activeFilterCount={activeFilterCount}
            specializationTags={specializationTags}
            disabilityTags={disabilityTags}
            methodologyTags={methodologyTags}
            tagsLoading={tagsLoading}
            tagsError={tagsError}
            onRetryTags={() => { void fetchTags(); }}
          />

          <section style={{ flex: 1, minWidth: 0 }}>
            {/* Sort row + active chips */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 16, flexWrap: 'wrap', gap: 12,
            }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                {appliedFilters.specializationTagIds.map(id => (
                  <span key={id} style={chip}>
                    {specTagName(id)}
                    <button type="button" style={chipX} onClick={() => removeSpecTag(id)}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-100)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    ><Icon d="M6 6l12 12M18 6L6 18" size={11} /></button>
                  </span>
                ))}
                {appliedFilters.city && (
                  <span style={chip}>
                    {appliedFilters.city}
                    <button type="button" style={chipX} onClick={removeCity}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-100)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    ><Icon d="M6 6l12 12M18 6L6 18" size={11} /></button>
                  </span>
                )}
                {appliedFilters.isVerified && (
                  <span style={chip}>
                    Верифіковані
                    <button type="button" style={chipX} onClick={removeVerified}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-100)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    ><Icon d="M6 6l12 12M18 6L6 18" size={11} /></button>
                  </span>
                )}
                {appliedFilters.isAccess && (
                  <span style={chip}>
                    Інклюзивно
                    <button type="button" style={chipX} onClick={removeAccess}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-100)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    ><Icon d="M6 6l12 12M18 6L6 18" size={11} /></button>
                  </span>
                )}
                {appliedFilters.methodologyTagIds.map(id => (
                  <span key={id} style={chip}>
                    {methodTagName(id)}
                    <button type="button" style={chipX} onClick={() => removeMethodTag(id)}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-100)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    ><Icon d="M6 6l12 12M18 6L6 18" size={11} /></button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Сортувати за:</span>
                <SortPill label="Рейтингом" active={sort === 'rating'} onClick={() => setSort('rating' as SortOption)} />
                <SortPill label="Вартістю ↑" active={sort === 'price-asc'} onClick={() => setSort('price-asc' as SortOption)} />
                <SortPill label="Вартістю ↓" active={sort === 'price-desc'} onClick={() => setSort('price-desc' as SortOption)} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: '#FEF2F2', border: '1px solid #FCA5A5',
                fontSize: 13.5, color: '#DC2626', marginBottom: 16,
              }}>{error}</div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 18,
              }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} style={{
                    background: 'white', border: '1px solid #E7E9EE', borderRadius: 16,
                    padding: 14, aspectRatio: '3/4',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                ))}
              </div>
            )}

            {/* Grid */}
            {!isLoading && trainers.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 18,
              }}>
                {trainers.map(t => <TrainerCard key={t.id} trainer={t} />)}
              </div>
            )}

            {/* Empty */}
            {!isLoading && !error && trainers.length === 0 && (
              <div style={{
                background: 'white', border: '1px dashed #D9DCE2', borderRadius: 16,
                padding: '60px 24px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>
                  Тренерів не знайдено
                </div>
                <div style={{ fontSize: 13.5, color: '#6B7280', marginBottom: 14 }}>
                  Спробуйте змінити критерії пошуку або скиньте фільтри
                </div>
                <button type="button" onClick={resetFilters} style={{
                  padding: '9px 18px', background: 'var(--accent-600)', color: 'white',
                  border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'background 150ms',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-700)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-600)')}
                >Скинути фільтри</button>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: 6, marginTop: 32,
              }}>
                <PageBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <Icon d="M15 6l-6 6 6 6" size={16} />
                </PageBtn>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <PageBtn key={n} active={page === n} onClick={() => setPage(n)}>{n}</PageBtn>
                ))}
                <PageBtn disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <Icon d="M9 6l6 6-6 6" size={16} />
                </PageBtn>
              </div>
            )}
          </section>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
