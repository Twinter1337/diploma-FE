import type { TrainerStep2Fields } from '../../../hooks/useTrainerOnboarding';
import type { Tag } from '../../../types';
import MultiSelectPills from '../MultiSelectPills';
import Icon from '../../ui/Icon';
import Input from '../../ui/Input';

interface TrainerStepTwoProps {
  fields: TrainerStep2Fields;
  onChange: (partial: Partial<TrainerStep2Fields>) => void;
  specializationTags: Tag[];
  methodologyTags: Tag[];
  disabilityTags: Tag[];
  tagsLoading: boolean;
  tagsError: string | null;
  onRetryTags: () => void;
  onNext: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export default function TrainerStepTwo({
  fields, onChange,
  specializationTags, methodologyTags, disabilityTags,
  tagsLoading, tagsError, onRetryTags,
  onNext, onBack, isLoading, error, onClearError,
}: TrainerStepTwoProps) {
  const toggleSpec = (id: number | string) => {
    const numId = Number(id);
    const updated = fields.specializationTagIds.includes(numId)
      ? fields.specializationTagIds.filter((x) => x !== numId)
      : [...fields.specializationTagIds, numId];
    onChange({ specializationTagIds: updated });
  };

  const toggleMethod = (id: number | string) => {
    const numId = Number(id);
    const updated = fields.methodologyTagIds.includes(numId)
      ? fields.methodologyTagIds.filter((x) => x !== numId)
      : [...fields.methodologyTagIds, numId];
    onChange({ methodologyTagIds: updated });
  };

  const toggleAccessTag = (id: number | string) => {
    const numId = Number(id);
    const updated = fields.accessTagIds.includes(numId)
      ? fields.accessTagIds.filter((x) => x !== numId)
      : [...fields.accessTagIds, numId];
    onChange({ accessTagIds: updated });
  };

  return (
    <>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.025em', fontFamily: 'var(--display)' }}>
          Професійна інформація
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 14.5, color: '#6B7280', lineHeight: 1.55 }}>
          Допоможе клієнтам зрозуміти, чи ви їм підходите
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Input
          label="Досвід, років"
          required
          type="number"
          value={fields.experienceYears}
          onChange={(v) => { onClearError(); onChange({ experienceYears: v }); }}
          placeholder="8"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
            Спеціалізації <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Оберіть напрями, в яких ви проводите заняття</span>
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
              options={specializationTags.map((t) => ({ value: t.id, label: t.name }))}
              selected={fields.specializationTagIds}
              onToggle={toggleSpec}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Методології</label>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>За якими методиками працюєте</span>
          {!tagsLoading && !tagsError && (
            <MultiSelectPills
              options={methodologyTags.map((t) => ({ value: t.id, label: t.name }))}
              selected={fields.methodologyTagIds}
              onToggle={toggleMethod}
            />
          )}
        </div>

        <div style={{
          padding: 18, borderRadius: 12,
          background: fields.hasAccess ? 'var(--accent-50)' : '#FAFBFC',
          border: `1px solid ${fields.hasAccess ? 'var(--accent-200)' : '#E7E9EE'}`,
          transition: 'all 150ms',
        }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={fields.hasAccess}
              onChange={(e) => onChange({ hasAccess: e.target.checked, accessTagIds: [] })}
              style={{ width: 18, height: 18, marginTop: 1, accentColor: 'var(--accent-600)', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                Маю кваліфікацію для роботи з особами з інвалідністю
              </div>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 4, lineHeight: 1.5 }}>
                Ваш профіль отримає спеціальну позначку та з'являтиметься у відповідних результатах пошуку.
              </div>
            </div>
          </label>

          {fields.hasAccess && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--accent-200)' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0F172A', marginBottom: 10 }}>
                З якими типами працюєте
              </div>
              {!tagsLoading && !tagsError && (
                <MultiSelectPills
                  options={disabilityTags.map((t) => ({ value: t.id, label: t.name }))}
                  selected={fields.accessTagIds}
                  onToggle={toggleAccessTag}
                />
              )}
            </div>
          )}
        </div>

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
            onClick={onNext}
            disabled={isLoading}
            style={{
              padding: '11px 22px', background: 'var(--accent-600)', color: 'white',
              border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: isLoading ? 0.7 : 1,
              boxShadow: '0 2px 8px var(--accent-shadow)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'opacity 120ms',
            }}
          >
            {isLoading ? 'Збереження…' : 'Далі'}
            <Icon d="M9 6l6 6-6 6" size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
