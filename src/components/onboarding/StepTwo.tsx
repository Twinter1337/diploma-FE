import type { Step2Fields } from '../../hooks/useOnboarding';
import type { Tag } from '../../types';
import { Gender } from '../../types';
import Input from '../ui/Input';
import SelectInput from './SelectInput';
import MultiSelectPills from './MultiSelectPills';
import Icon from '../ui/Icon';

const GOALS = [
  'Схуднення', "Набір м'язової маси", 'Витривалість', 'Гнучкість',
  'Реабілітація', "Загальне здоров'я", 'Підготовка до змагань', 'Зняття стресу',
];

const GENDER_OPTIONS = [
  { value: String(Gender.Male), label: 'Чоловіча' },
  { value: String(Gender.Female), label: 'Жіноча' },
  { value: String(Gender.Other), label: 'Інша' },
];

interface StepTwoProps {
  fields: Step2Fields;
  onChange: (partial: Partial<Step2Fields>) => void;
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

export default function StepTwo({
  fields, onChange, disabilityTags, tagsLoading, tagsError, onRetryTags,
  onNext, onBack, isLoading, error, onClearError,
}: StepTwoProps) {
  const toggleGoal = (goal: string) => {
    const updated = fields.goalPills.includes(goal)
      ? fields.goalPills.filter((g) => g !== goal)
      : [...fields.goalPills, goal];
    onChange({ goalPills: updated });
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
          Параметри та цілі
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 14.5, color: '#6B7280', lineHeight: 1.55 }}>
          Ця інформація буде доступна тільки тренерам, до яких ви запишетесь
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input
            label="Зріст, см"
            required
            type="number"
            value={fields.heightCm}
            onChange={(v) => { onClearError(); onChange({ heightCm: v }); }}
            placeholder="170"
          />
          <Input
            label="Вага, кг"
            required
            type="number"
            value={fields.weightKg}
            onChange={(v) => { onClearError(); onChange({ weightKg: v }); }}
            placeholder="65"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <SelectInput
            label="Стать"
            required
            value={fields.gender !== null ? String(fields.gender) : ''}
            onChange={(v) => { onClearError(); onChange({ gender: parseInt(v) as Gender }); }}
            options={GENDER_OPTIONS}
            placeholder="Оберіть стать"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
              Дата народження <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="date"
              value={fields.birthDate}
              onChange={(e) => { onClearError(); onChange({ birthDate: e.target.value }); }}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #D9DCE2',
                fontSize: 14, color: '#0F172A', fontFamily: 'inherit', background: 'white',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{
          padding: 18, borderRadius: 12,
          background: fields.accessibilityEnabled ? 'var(--accent-50)' : '#FAFBFC',
          border: `1px solid ${fields.accessibilityEnabled ? 'var(--accent-200)' : '#E7E9EE'}`,
          transition: 'all 150ms',
        }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={fields.accessibilityEnabled}
              onChange={(e) => onChange({ accessibilityEnabled: e.target.checked, accessTagIds: [] })}
              style={{ width: 18, height: 18, marginTop: 1, accentColor: 'var(--accent-600)', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                Маю інвалідність або особливі фізичні потреби
              </div>
            </div>
          </label>

          {fields.accessibilityEnabled && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--accent-200)' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0F172A', marginBottom: 10 }}>
                Тип особливих потреб
              </div>
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

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 10, borderTop: '1px solid #EDEFF3',
        }}>
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
            {isLoading ? 'Збереження…' : 'Почати пошук тренера'}
            <Icon d="M9 6l6 6-6 6" size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
