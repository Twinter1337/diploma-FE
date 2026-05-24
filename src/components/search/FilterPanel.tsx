import type { Tag } from '../../types';
import type { SearchFilters } from '../../hooks/useTrainerSearch';
import Icon from '../ui/Icon';
import MultiSelectPills from '../onboarding/MultiSelectPills';
import DualRangeSlider from './DualRangeSlider';
import { useIsMobile } from '../../hooks/useWindowWidth';

const UA_CITIES = [
  'Київ', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя', 'Львів',
  'Кривий Ріг', 'Миколаїв', 'Херсон', 'Полтава', 'Чернігів',
  'Черкаси', 'Житомир', 'Суми', 'Хмельницький', 'Рівне',
  'Івано-Франківськ', 'Вінниця', 'Тернопіль', 'Ужгород',
];

function StarBtn({ n, active, onClick }: { n: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none', border: 'none', padding: 4, cursor: 'pointer',
        color: active ? '#F5A524' : '#D9DCE2', display: 'inline-flex',
        transition: 'color 150ms',
      }}
    >
      <svg width={22} height={22} viewBox="0 0 24 24">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
        />
      </svg>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>{n}</span>
    </button>
  );
}

const fieldInput = (hasLeft: boolean): React.CSSProperties => ({
  width: '100%', padding: hasLeft ? '9px 12px 9px 34px' : '9px 12px',
  borderRadius: 9, border: '1px solid #D9DCE2', background: 'white',
  fontSize: 13, color: '#0F172A', fontFamily: 'inherit',
  outline: 'none', transition: 'border-color 120ms, box-shadow 120ms',
  boxSizing: 'border-box',
});

interface FilterPanelProps {
  filters: SearchFilters;
  setFilters: (updater: (prev: SearchFilters) => SearchFilters) => void;
  onApply: () => void;
  onReset: () => void;
  activeFilterCount: number;
  specializationTags: Tag[];
  disabilityTags: Tag[];
  methodologyTags: Tag[];
  tagsLoading: boolean;
  tagsError: string | null;
  onRetryTags: () => void;
}

export default function FilterPanel({
  filters, setFilters, onApply, onReset, activeFilterCount,
  specializationTags, disabilityTags, methodologyTags,
  tagsLoading, tagsError, onRetryTags,
}: FilterPanelProps) {
  const isMobile = useIsMobile();
  const update = <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) =>
    setFilters(f => ({ ...f, [k]: v }));

  const toggleSpec = (id: number | string) => {
    const n = Number(id);
    setFilters(f => ({
      ...f,
      specializationTagIds: f.specializationTagIds.includes(n)
        ? f.specializationTagIds.filter(x => x !== n)
        : [...f.specializationTagIds, n],
    }));
  };

  const toggleDisability = (id: number | string) => {
    const n = Number(id);
    setFilters(f => ({
      ...f,
      disabilityTagIds: f.disabilityTagIds.includes(n)
        ? f.disabilityTagIds.filter(x => x !== n)
        : [...f.disabilityTagIds, n],
    }));
  };

  const toggleMethodology = (id: number | string) => {
    const n = Number(id);
    setFilters(f => ({
      ...f,
      methodologyTagIds: f.methodologyTagIds.includes(n)
        ? f.methodologyTagIds.filter(x => x !== n)
        : [...f.methodologyTagIds, n],
    }));
  };

  return (
    <aside style={{
      width: isMobile ? '100%' : 280, flexShrink: 0,
      position: isMobile ? 'static' : 'sticky', top: 84, alignSelf: 'flex-start',
      background: 'white', borderRadius: 16, border: '1px solid #E7E9EE',
      padding: 18, display: 'flex', flexDirection: 'column', gap: 18,
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Icon d="M3 6h18M6 12h12M10 18h4" size={16} />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Фільтри</h2>
          {activeFilterCount > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: 'var(--accent-600)', color: 'white',
              padding: '2px 7px', borderRadius: 999,
            }}>{activeFilterCount}</span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button type="button" onClick={onReset} style={{
            background: 'none', border: 'none', color: '#6B7280',
            fontSize: 12.5, cursor: 'pointer', padding: 0,
            fontFamily: 'inherit', textDecoration: 'underline',
            transition: 'color 150ms',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#0F172A')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
          >Скинути</button>
        )}
      </div>

      {/* Name search */}
      <FilterField label="Пошук за ім'ям">
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
            <Icon d="M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-3.5-3.5" size={15} />
          </span>
          <input
            value={filters.name}
            onChange={e => update('name', e.target.value)}
            placeholder="Наприклад, Олена"
            maxLength={100}
            style={fieldInput(true)}
          />
        </div>
      </FilterField>

      {/* Specialization */}
      <FilterField label="Спеціалізація">
        {tagsLoading && <span style={{ fontSize: 13, color: '#9CA3AF' }}>Завантаження…</span>}
        {tagsError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#DC2626' }}>{tagsError}</span>
            <button type="button" onClick={onRetryTags} style={{ fontSize: 12, color: 'var(--accent-600)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
              Спробувати ще
            </button>
          </div>
        )}
        {!tagsLoading && !tagsError && (
          <MultiSelectPills
            options={specializationTags.map(t => ({ value: t.id, label: t.name }))}
            selected={filters.specializationTagIds}
            onToggle={toggleSpec}
            compact
            initialVisible={5}
          />
        )}
      </FilterField>

      {/* City */}
      <FilterField label="Місто">
        <div style={{ position: 'relative' }}>
          <select
            value={filters.city}
            onChange={e => update('city', e.target.value)}
            style={{ ...fieldInput(false), appearance: 'none', paddingRight: 32, cursor: 'pointer' }}
          >
            <option value="">Усі міста</option>
            {UA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}>
            <Icon d="M6 9l6 6 6-6" size={16} />
          </span>
        </div>
      </FilterField>

      {/* Min rating */}
      <FilterField label="Мінімальний рейтинг">
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <StarBtn
              key={n}
              n={n}
              active={filters.minRating >= n}
              onClick={() => update('minRating', filters.minRating === n ? 0 : n)}
            />
          ))}
          <span style={{ marginLeft: 6, fontSize: 12.5, color: '#6B7280' }}>
            {filters.minRating > 0 ? `від ${filters.minRating}.0` : 'будь-який'}
          </span>
        </div>
      </FilterField>

      {/* Price range */}
      <FilterField label="Вартість заняття, грн">
        <DualRangeSlider
          min={0} max={5000} step={50}
          value={filters.price}
          onChange={v => update('price', v)}
        />
      </FilterField>

      {/* Verified */}
      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 12px', borderRadius: 10,
        background: filters.isVerified ? 'var(--accent-50)' : '#F8F9FB',
        border: `1px solid ${filters.isVerified ? 'var(--accent-200)' : '#EAECF0'}`,
        cursor: 'pointer', transition: 'all 120ms',
      }}>
        <input
          type="checkbox"
          checked={filters.isVerified}
          onChange={e => update('isVerified', e.target.checked)}
          style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--accent-600)', cursor: 'pointer', flexShrink: 0 }}
        />
        <span style={{ fontSize: 12.5, color: '#3F4651', lineHeight: 1.45 }}>
          Тільки верифіковані тренери
        </span>
      </label>

      {/* Accessible */}
      <div style={{
        padding: 12, borderRadius: 10,
        background: filters.isAccess ? 'var(--accent-50)' : '#F8F9FB',
        border: `1px solid ${filters.isAccess ? 'var(--accent-200)' : '#EAECF0'}`,
        transition: 'all 150ms',
      }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filters.isAccess}
            onChange={e => update('isAccess', e.target.checked)}
            style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--accent-600)', cursor: 'pointer', flexShrink: 0 }}
          />
          <span style={{ fontSize: 12.5, color: '#3F4651', lineHeight: 1.45 }}>
            Кваліфікація для роботи з особами з інвалідністю
          </span>
        </label>

        {filters.isAccess && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--accent-200)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', marginBottom: 10 }}>
              Тип обмежень (необов'язково)
            </div>
            <div style={{ fontSize: 11.5, color: '#9CA3AF', marginBottom: 8 }}>
              Не вибрано — показати всіх інклюзивних тренерів
            </div>
            {!tagsLoading && !tagsError && (
              <MultiSelectPills
                options={disabilityTags.map(t => ({ value: t.id, label: t.name }))}
                selected={filters.disabilityTagIds}
                onToggle={toggleDisability}
                compact
                initialVisible={5}
              />
            )}
          </div>
        )}
      </div>

      {/* Methodology */}
      {!tagsLoading && !tagsError && methodologyTags.length > 0 && (
        <FilterField label="Методологія">
          <MultiSelectPills
            options={methodologyTags.map(t => ({ value: t.id, label: t.name }))}
            selected={filters.methodologyTagIds}
            onToggle={toggleMethodology}
            compact
            initialVisible={5}
          />
        </FilterField>
      )}

      <button
        type="button"
        onClick={onApply}
        style={{
          marginTop: 4, padding: '11px 16px',
          background: 'var(--accent-600)', color: 'white',
          border: 'none', borderRadius: 10,
          fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', transition: 'background 120ms',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-700)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-600)')}
      >
        Застосувати фільтри
      </button>
    </aside>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0F172A', letterSpacing: '0.01em' }}>{label}</label>
      {children}
    </div>
  );
}
