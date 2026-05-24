import { useState, useRef, useEffect } from 'react';
import type { ClientProfileData } from '../../types';
import type { SettingsFields } from '../../hooks/useClientDashboard';
import { useAuthContext } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useWindowWidth';

const UA_CITIES = [
  'Київ', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя', 'Львів',
  'Кривий Ріг', 'Миколаїв', 'Херсон', 'Полтава', 'Чернігів',
  'Черкаси', 'Житомир', 'Суми', 'Хмельницький', 'Рівне',
  'Івано-Франківськ', 'Вінниця', 'Тернопіль', 'Ужгород',
];

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #E7E9EE', borderRadius: 14, padding: 20,
};
const sectionTitle: React.CSSProperties = {
  margin: 0, fontSize: 17, fontWeight: 700, color: '#0F172A',
  letterSpacing: '-0.02em', fontFamily: 'var(--display)',
};
const btnPrimary: React.CSSProperties = {
  padding: '9px 16px', background: 'var(--accent-600)', color: 'white',
  border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
};
const btnGhost: React.CSSProperties = {
  padding: '9px 16px', background: 'white', color: '#3F4651',
  border: '1.5px solid #E7E9EE', borderRadius: 9,
  fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({
  value, onChange, type = 'text', placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: '10px 12px', borderRadius: 9, border: '1px solid #D9DCE2',
        fontSize: 13.5, color: '#0F172A', fontFamily: 'inherit',
        background: 'white', outline: 'none', width: '100%', boxSizing: 'border-box',
      }}
    />
  );
}

function nameHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % 360;
  return h;
}

interface Props {
  profile: ClientProfileData | null;
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  isUploadingAvatar: boolean;
  isDeletingAvatar: boolean;
  isDeletingAccount: boolean;
  onSave: (fields: SettingsFields) => Promise<boolean>;
  onAvatarUpload: (file: File) => Promise<string | null>;
  onAvatarDelete: () => Promise<boolean>;
  onDeleteAccount: () => Promise<boolean>;
  onClearError: () => void;
}

export default function SettingsTab({
  profile,
  isLoading,
  isSaving,
  saveError,
  saveSuccess,
  isUploadingAvatar,
  isDeletingAvatar,
  isDeletingAccount,
  onSave,
  onAvatarUpload,
  onAvatarDelete,
  onDeleteAccount,
  onClearError,
}: Props) {
  const { user } = useAuthContext();
  const isAdmin = user?.role === 2;
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setEmail(profile.email);
    setCity(profile.city ?? '');
    setHeightCm(profile.heightCm != null ? String(profile.heightCm) : '');
    setWeightKg(profile.weightKg != null ? String(profile.weightKg) : '');
    setSelectedTagIds(profile.disabilityTags.filter(t => t.isSelected).map(t => t.id));
    setAvatarPreview(profile.avatarUrl);
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    await onAvatarUpload(file);
  };

  const handleSave = async () => {
    await onSave({ firstName, lastName, email, city, heightCm, weightKg, selectedTagIds });
  };

  const handleReset = () => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setEmail(profile.email);
    setCity(profile.city ?? '');
    setHeightCm(profile.heightCm != null ? String(profile.heightCm) : '');
    setWeightKg(profile.weightKg != null ? String(profile.weightKg) : '');
    setSelectedTagIds(profile.disabilityTags.filter(t => t.isSelected).map(t => t.id));
    setAvatarPreview(profile.avatarUrl);
    onClearError();
  };

  const toggleTag = (id: number) => {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  if (isLoading || !profile) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[200, 160, 140].map((h, i) => (
            <div key={i} style={{ ...card, height: h, background: '#F8F9FB' }} />
          ))}
        </div>
        <div style={{ ...card, height: 160, background: '#F8F9FB' }} />
      </div>
    );
  }

  const displayName = `${firstName || profile.firstName} ${lastName || profile.lastName}`;
  const hue = nameHue(displayName);
  const initials = `${(firstName || profile.firstName)[0] ?? ''}${(lastName || profile.lastName)[0] ?? ''}`;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: 20, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Personal data */}
        <section style={card}>
          <h2 style={sectionTitle}>Особисті дані</h2>
          <div style={{ display: 'flex', gap: 18, alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', margin: '16px 0 20px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
              background: avatarPreview
                ? 'transparent'
                : `linear-gradient(135deg, hsl(${hue},70%,55%) 0%, hsl(${(hue + 40) % 360},65%,70%) 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 22, fontWeight: 700,
            }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                style={{ ...btnPrimary, marginRight: 8, opacity: isUploadingAvatar ? 0.6 : 1 }}
              >
                {isUploadingAvatar ? 'Завантаження…' : 'Завантажити фото'}
              </button>
              <button
                onClick={async () => {
                  const ok = await onAvatarDelete();
                  if (ok) setAvatarPreview(null);
                }}
                disabled={isDeletingAvatar || !avatarPreview}
                style={{ ...btnGhost, opacity: (isDeletingAvatar || !avatarPreview) ? 0.5 : 1, cursor: (isDeletingAvatar || !avatarPreview) ? 'not-allowed' : 'pointer' }}
              >
                {isDeletingAvatar ? 'Видалення…' : 'Видалити'}
              </button>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9CA3AF' }}>JPG або PNG, макс. 10 МБ</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <Field label="Ім'я">
              <TextInput value={firstName} onChange={setFirstName} placeholder="Ім'я" />
            </Field>
            <Field label="Прізвище">
              <TextInput value={lastName} onChange={setLastName} placeholder="Прізвище" />
            </Field>
            <Field label="Електронна пошта">
              <TextInput value={email} onChange={setEmail} type="email" placeholder="email@example.com" />
            </Field>
            <Field label="Місто">
              <div style={{ position: 'relative' }}>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={{
                    padding: '10px 12px', paddingRight: 32, borderRadius: 9,
                    border: '1px solid #D9DCE2', fontSize: 13.5, color: city ? '#0F172A' : '#9CA3AF',
                    fontFamily: 'inherit', background: 'white', outline: 'none',
                    width: '100%', boxSizing: 'border-box', appearance: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">Оберіть місто</option>
                  {UA_CITIES.map(c => <option key={c} value={c} style={{ color: '#0F172A' }}>{c}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}>
                  ▾
                </span>
              </div>
            </Field>
          </div>
        </section>

        {/* Physical params */}
        {!isAdmin && (
        <section style={card}>
          <h2 style={sectionTitle}>Фізичні параметри</h2>
          <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#6B7280' }}>
            Допоможе тренерам підібрати оптимальну програму
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            <Field label="Зріст, см">
              <TextInput value={heightCm} onChange={setHeightCm} type="number" placeholder="170" />
            </Field>
            <Field label="Вага, кг">
              <TextInput value={weightKg} onChange={setWeightKg} type="number" placeholder="70" />
            </Field>
          </div>
        </section>
        )}

        {/* Accessibility */}
        {!isAdmin && profile.disabilityTags.length > 0 && (
          <section style={card}>
            <h2 style={sectionTitle}>Особливі потреби</h2>
            <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#6B7280' }}>
              Допомагає підбирати тренерів з відповідною кваліфікацією. Інформація приватна.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.disabilityTags.map(tag => {
                const active = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    style={{
                      padding: '8px 14px', fontSize: 13, fontWeight: 500,
                      borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                      background: active ? 'var(--accent-50)' : 'white',
                      color: active ? 'var(--accent-700)' : '#3F4651',
                      border: `1.5px solid ${active ? 'var(--accent-600)' : '#D9DCE2'}`,
                      transition: 'all 120ms',
                    }}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {saveError && (
          <div style={{
            padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 10, color: '#DC2626', fontSize: 13.5,
          }}>
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div style={{
            padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0',
            borderRadius: 10, color: '#047857', fontSize: 13.5, fontWeight: 500,
          }}>
            Зміни збережено
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={handleReset} style={btnGhost}>Скасувати</button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{ ...btnPrimary, opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
          >
            {isSaving ? 'Збереження…' : 'Зберегти зміни'}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside style={{ ...card, position: isMobile ? 'static' : 'sticky', top: 80, padding: 18 }}>
        <h3 style={{ ...sectionTitle, fontSize: 14, marginBottom: 10 }}>Захист даних</h3>
        <p style={{ margin: 0, fontSize: 12.5, color: '#6B7280', lineHeight: 1.6 }}>
          Ваші особисті дані видимі лише тренеру, до якого ви записались. Ми не передаємо їх третім особам.
        </p>

        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            style={{
              width: '100%', marginTop: 14, padding: '9px 14px',
              background: 'transparent', border: 'none', color: '#DC2626',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              borderRadius: 8,
            }}
          >
            Видалити акаунт
          </button>
        ) : (
          <div style={{
            marginTop: 14, padding: '12px 14px',
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
          }}>
            <p style={{ margin: '0 0 10px', fontSize: 12.5, color: '#7F1D1D', lineHeight: 1.5 }}>
              <strong>Ви впевнені?</strong> Акаунт та всі дані будуть видалені. Цю дію неможливо скасувати.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirmingDelete(false)}
                style={{ ...btnGhost, flex: 1, padding: '7px 10px', fontSize: 12.5 }}
              >
                Назад
              </button>
              <button
                onClick={async () => {
                  setConfirmingDelete(false);
                  await onDeleteAccount();
                }}
                disabled={isDeletingAccount}
                style={{
                  flex: 1, padding: '7px 10px', fontSize: 12.5, fontWeight: 600,
                  background: isDeletingAccount ? '#F87171' : '#DC2626',
                  color: 'white', border: 'none', borderRadius: 8,
                  cursor: isDeletingAccount ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {isDeletingAccount ? 'Видалення…' : 'Видалити'}
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
