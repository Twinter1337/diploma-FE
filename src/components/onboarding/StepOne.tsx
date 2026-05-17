import type { Step1Fields } from '../../hooks/useOnboarding';
import AvatarUpload from './AvatarUpload';
import SelectInput from './SelectInput';
import Icon from '../ui/Icon';

const UA_CITIES = [
  'Київ', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя', 'Львів',
  'Кривий Ріг', 'Миколаїв', 'Херсон', 'Полтава', 'Чернігів',
  'Черкаси', 'Житомир', 'Суми', 'Хмельницький', 'Рівне',
  'Івано-Франківськ', 'Вінниця', 'Тернопіль', 'Ужгород',
];

const textareaStyle: React.CSSProperties = {
  width: '100%', padding: 14, borderRadius: 10, border: '1px solid #D9DCE2',
  fontSize: 14, color: '#0F172A', fontFamily: 'inherit', background: 'white',
  outline: 'none', boxSizing: 'border-box', minHeight: 110, resize: 'vertical', lineHeight: 1.55,
};

interface StepOneProps {
  fields: Step1Fields;
  onChange: (partial: Partial<Step1Fields>) => void;
  onNext: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
  onUploadAvatar: (file: File) => Promise<void>;
  isUploadingAvatar?: boolean;
  uploadAvatarError?: string | null;
}

export default function StepOne({ fields, onChange, onNext, isLoading, error, onClearError, onUploadAvatar, isUploadingAvatar, uploadAvatarError }: StepOneProps) {
  return (
    <>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.025em', fontFamily: 'var(--display)' }}>
          Розкажіть про себе
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 14.5, color: '#6B7280', lineHeight: 1.55 }}>
          Ця інформація допоможе підібрати тренерів, які підходять саме вам
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
          onChange={(v) => onChange({ city: v })}
          placeholder="Оберіть місто"
          options={UA_CITIES.map((c) => ({ value: c, label: c }))}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
            Про себе
          </label>
          <textarea
            value={fields.about}
            onChange={(e) => { onClearError(); onChange({ about: e.target.value }); }}
            placeholder="Розкажіть коротко про себе, свій спортивний досвід та що вас мотивує…"
            style={textareaStyle}
          />
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            Тренери побачать це, коли ви забронюєте заняття
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
