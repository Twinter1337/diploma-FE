import type { TrainerStep1Fields } from '../../../hooks/useTrainerOnboarding';
import { Gender } from '../../../types';
import AvatarUpload from '../AvatarUpload';
import SelectInput from '../SelectInput';
import Icon from '../../ui/Icon';

const UA_CITIES = [
  'Київ', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя', 'Львів',
  'Кривий Ріг', 'Миколаїв', 'Херсон', 'Полтава', 'Чернігів',
  'Черкаси', 'Житомир', 'Суми', 'Хмельницький', 'Рівне',
  'Івано-Франківськ', 'Вінниця', 'Тернопіль', 'Ужгород',
];

const GENDER_OPTIONS = [
  { value: String(Gender.Male), label: 'Чоловіча' },
  { value: String(Gender.Female), label: 'Жіноча' },
  { value: String(Gender.Other), label: 'Інша' },
];

const textareaStyle: React.CSSProperties = {
  width: '100%', padding: 14, borderRadius: 10, border: '1px solid #D9DCE2',
  fontSize: 14, color: '#0F172A', fontFamily: 'inherit', background: 'white',
  outline: 'none', boxSizing: 'border-box', minHeight: 110, resize: 'vertical', lineHeight: 1.55,
};

const dateInputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #D9DCE2',
  fontSize: 14, color: '#0F172A', fontFamily: 'inherit', background: 'white',
  outline: 'none', boxSizing: 'border-box',
};

interface TrainerStepOneProps {
  fields: TrainerStep1Fields;
  onChange: (partial: Partial<TrainerStep1Fields>) => void;
  onNext: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
  onUploadAvatar: (file: File) => Promise<void>;
  isUploadingAvatar?: boolean;
  uploadAvatarError?: string | null;
}

export default function TrainerStepOne({ fields, onChange, onNext, isLoading, error, onClearError, onUploadAvatar, isUploadingAvatar, uploadAvatarError }: TrainerStepOneProps) {
  return (
    <>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.025em', fontFamily: 'var(--display)' }}>
          Розкажіть про себе
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 14.5, color: '#6B7280', lineHeight: 1.55 }}>
          Ця інформація буде показана у вашому публічному профілі тренера
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <AvatarUpload
          avatarUrl={fields.avatarUrl}
          onUpload={onUploadAvatar}
          isUploading={isUploadingAvatar}
          uploadError={uploadAvatarError}
        />

        <SelectInput
          label="Місто"
          required
          value={fields.city}
          onChange={(v) => { onClearError(); onChange({ city: v }); }}
          placeholder="Оберіть місто"
          options={UA_CITIES.map((c) => ({ value: c, label: c }))}
        />

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
              style={dateInputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Про себе</label>
          <textarea
            value={fields.bio}
            onChange={(e) => { onClearError(); onChange({ bio: e.target.value }); }}
            placeholder="Сертифікований тренер. Розкажіть про підхід, освіту, з ким працюєте — це бачать клієнти у вашому профілі…"
            style={textareaStyle}
          />
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            Клієнти побачать це у вашому публічному профілі
          </span>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FCA5A5', fontSize: 13, color: '#DC2626' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid #EDEFF3' }}>
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
