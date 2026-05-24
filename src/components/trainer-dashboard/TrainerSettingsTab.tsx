import { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useWindowWidth';

const UA_CITIES = [
  'Київ', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя', 'Львів',
  'Кривий Ріг', 'Миколаїв', 'Херсон', 'Полтава', 'Чернігів',
  'Черкаси', 'Житомир', 'Суми', 'Хмельницький', 'Рівне',
  'Івано-Франківськ', 'Вінниця', 'Тернопіль', 'Ужгород',
];

import type { TrainerProfile, TrainerDocument, Tag } from '../../types';
import { DocumentType, DocumentStatus, Gender } from '../../types';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  patchTrainerStep1,
  patchTrainerStep2,
  getSpecializationTags,
  getMethodologyTags,
  getDisabilityTags,
  postTrainerDocument,
  getTrainerDocuments,
  deleteTrainerDocument,
} from '../../services/trainerService';
import { uploadAvatar, deleteAvatar } from '../../services/userService';
import DashAvatar from './DashAvatar';

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #E7E9EE', borderRadius: 14, padding: 22,
};
const inputStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 9, border: '1px solid #D9DCE2',
  fontSize: 13.5, color: '#0F172A', fontFamily: 'inherit',
  background: 'white', outline: 'none', width: '100%', boxSizing: 'border-box',
};
const btnPrimary: React.CSSProperties = {
  padding: '9px 18px', background: 'var(--accent-600)', color: 'white',
  border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
};
const btnGhost: React.CSSProperties = {
  padding: '9px 16px', background: 'white', color: '#3F4651',
  border: '1.5px solid #E7E9EE', borderRadius: 9,
  fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};
const sectionTitle: React.CSSProperties = {
  margin: 0, fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em',
};

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.Certificate]: 'Сертифікат',
  [DocumentType.Diploma]: 'Диплом',
  [DocumentType.License]: 'Ліцензія',
  [DocumentType.Other]: 'Інше',
};

const DOC_STATUS_CFG: Record<DocumentStatus, { bg: string; color: string; dot: string; label: string }> = {
  [DocumentStatus.Pending]:  { bg: '#FFFBEB', color: '#B45309', dot: '#F59E0B', label: 'Перевіряється' },
  [DocumentStatus.Approved]: { bg: '#ECFDF5', color: '#047857', dot: '#10B981', label: 'Верифіковано' },
  [DocumentStatus.Rejected]: { bg: '#FEF2F2', color: '#B91C1C', dot: '#EF4444', label: 'Відхилено' },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1048576).toFixed(1)} МБ`;
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>{label}</label>
      {children}
    </div>
  );
}

function DocStatusBadge({ status }: { status: DocumentStatus }) {
  const c = DOC_STATUS_CFG[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px 3px 8px', fontSize: 11.5, fontWeight: 600,
      borderRadius: 999, background: c.bg, color: c.color, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {c.label}
    </span>
  );
}

interface Props {
  trainerId: string;
  profile: TrainerProfile | null;
  isLoading: boolean;
  onSaved?: () => Promise<void>;
}

export default function TrainerSettingsTab({ trainerId, profile, isLoading, onSaved }: Props) {
  const { user } = useAuthContext();
  const isMobile = useIsMobile();

  // Profile form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.Other);
  const [birthDate, setBirthDate] = useState('');
  const [selectedSpecIds, setSelectedSpecIds] = useState<number[]>([]);
  const [selectedMethodIds, setSelectedMethodIds] = useState<number[]>([]);
  const [allSpecs, setAllSpecs] = useState<Tag[]>([]);
  const [allMethods, setAllMethods] = useState<Tag[]>([]);
  const [allDisabilityTags, setAllDisabilityTags] = useState<Tag[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedAccessTagIds, setSelectedAccessTagIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Avatar
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Documents list
  const [documents, setDocuments] = useState<TrainerDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Document upload
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>(DocumentType.Certificate);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docSuccess, setDocSuccess] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      setCity(profile.city ?? '');
      setBio(profile.bio ?? '');
      setExperienceYears(String(profile.experienceYears));
      setSelectedSpecIds(profile.specializationTags.map(t => t.id));
      setSelectedMethodIds(profile.methodologyTags.map(t => t.id));
      setHasAccess(profile.isAccessible);
      setSelectedAccessTagIds((profile.disabilityTags ?? []).map(t => t.id));
      setAvatarPreview(profile.avatarUrl ?? null);
    }
    if (user) {
      setGender(user.gender ?? Gender.Other);
      setBirthDate(user.birthDate ?? '');
    }
  }, [profile, user]);

  useEffect(() => {
    getSpecializationTags().then(setAllSpecs).catch(() => {});
    getMethodologyTags().then(setAllMethods).catch(() => {});
    getDisabilityTags().then(setAllDisabilityTags).catch(() => {});
  }, []);

  const fetchDocuments = () => {
    if (!trainerId) return;
    setDocsLoading(true);
    getTrainerDocuments(trainerId)
      .then(setDocuments)
      .catch(() => {})
      .finally(() => setDocsLoading(false));
  };

  useEffect(fetchDocuments, [trainerId]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploadingAvatar(true);
    try {
      const { avatarUrl } = await uploadAvatar(user.id, file);
      setAvatarPreview(avatarUrl);
    } catch {
      // silently ignore
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!user) return;
    setIsDeletingAvatar(true);
    try {
      await deleteAvatar(user.id);
      setAvatarPreview(null);
    } catch {
      // silently ignore
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await Promise.all([
        patchTrainerStep1(trainerId, {
          firstName,
          lastName,
          avatarUrl: avatarPreview ?? '',
          city,
          gender,
          birthDate,
          bio,
        }),
        patchTrainerStep2(trainerId, {
          experienceYears: parseInt(experienceYears, 10) || 0,
          specializationTagIds: selectedSpecIds,
          methodologyTagIds: selectedMethodIds,
          hasAccess,
          accessTagIds: hasAccess ? selectedAccessTagIds : [],
        }),
      ]);
      await onSaved?.();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Помилка збереження');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocUpload = async () => {
    if (!docFile) return;
    setIsUploadingDoc(true);
    setDocError(null);
    setDocSuccess(false);
    try {
      await postTrainerDocument(trainerId, { file: docFile, documentType: docType });
      setDocSuccess(true);
      setDocFile(null);
      setTimeout(() => setDocSuccess(false), 3000);
      fetchDocuments();
    } catch (e) {
      setDocError(e instanceof Error ? e.message : 'Помилка завантаження');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    setDeletingId(docId);
    try {
      await deleteTrainerDocument(trainerId, docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch {
      // silently ignore
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSpecTag = (id: number) =>
    setSelectedSpecIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleMethodTag = (id: number) =>
    setSelectedMethodIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAccessTag = (id: number) =>
    setSelectedAccessTagIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2].map(i => <div key={i} style={{ ...card, height: 200, background: '#F8F9FB' }} />)}
      </div>
    );
  }

  const displayName = `${firstName} ${lastName}`.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', background: 'white', border: '1px solid #E7E9EE', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#047857' }}>Профіль активний</span>
          </div>
          {profile && (
            <>
              <span style={{ width: 1, height: 16, background: '#E7E9EE' }} />
              {profile.verificationStatus === 2 ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#047857' }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5 9-11" />
                  </svg>
                  Верифікований тренер
                </div>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 600, color: '#B45309' }}>
                  {profile.verificationStatus === 1 ? 'Верифікація в процесі' : 'Не верифікований'}
                </span>
              )}
            </>
          )}
        </div>

        {/* Personal data */}
        <section style={card}>
          <h2 style={sectionTitle}>Особисті дані</h2>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 18, alignItems: isMobile ? 'flex-start' : 'center', margin: '16px 0 20px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <DashAvatar name={displayName || 'T'} size={72} />
              )}
              {isUploadingAvatar && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: 11 }}>…</span>
                </div>
              )}
            </div>
            <div>
              <label style={{ ...btnPrimary, display: 'inline-block', marginRight: 8, cursor: isUploadingAvatar ? 'not-allowed' : 'pointer', opacity: isUploadingAvatar ? 0.6 : 1 }}>
                {isUploadingAvatar ? 'Завантаження…' : 'Завантажити фото'}
                <input type="file" accept="image/jpeg,image/png" onChange={handleAvatarChange} style={{ display: 'none' }} disabled={isUploadingAvatar} />
              </label>
              <button
                type="button"
                onClick={handleAvatarDelete}
                disabled={isDeletingAvatar || !avatarPreview}
                style={{ ...btnGhost, opacity: (isDeletingAvatar || !avatarPreview) ? 0.5 : 1, cursor: (isDeletingAvatar || !avatarPreview) ? 'not-allowed' : 'pointer' }}
              >
                {isDeletingAvatar ? 'Видалення…' : 'Видалити'}
              </button>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9CA3AF' }}>JPG або PNG, макс. 5 МБ</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FieldLabel label="Ім'я">
              <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} />
            </FieldLabel>
            <FieldLabel label="Прізвище">
              <input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} />
            </FieldLabel>
            <FieldLabel label="Місто">
              <div style={{ position: 'relative' }}>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 32, appearance: 'none', cursor: 'pointer', color: city ? '#0F172A' : '#9CA3AF' }}
                >
                  <option value="">Оберіть місто</option>
                  {UA_CITIES.map(c => <option key={c} value={c} style={{ color: '#0F172A' }}>{c}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}>▾</span>
              </div>
            </FieldLabel>
            <FieldLabel label="Досвід (років)">
              <input type="number" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} style={inputStyle} min="0" max="80" />
            </FieldLabel>
            <FieldLabel label="Стать">
              <select value={gender} onChange={e => setGender(Number(e.target.value) as Gender)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value={Gender.Male}>Чоловіча</option>
                <option value={Gender.Female}>Жіноча</option>
                <option value={Gender.Other}>Інша</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Дата народження">
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={inputStyle} />
            </FieldLabel>
          </div>

          <FieldLabel label="Біографія">
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              style={{ ...inputStyle, minHeight: 110, resize: 'vertical', lineHeight: 1.55 }}
            />
          </FieldLabel>
        </section>

        {/* Specializations */}
        <section style={card}>
          <h2 style={sectionTitle}>Спеціалізації</h2>
          <p style={{ margin: '4px 0 14px', fontSize: 13, color: '#6B7280' }}>Відображаються у профілі та впливають на пошук</p>

          {allSpecs.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Спеціалізації</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allSpecs.map(t => {
                  const sel = selectedSpecIds.includes(t.id);
                  return (
                    <button key={t.id} onClick={() => toggleSpecTag(t.id)} style={{
                      padding: '5px 12px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                      borderRadius: 999, fontFamily: 'inherit', transition: 'all 120ms',
                      background: sel ? 'var(--accent-50)' : 'white',
                      color: sel ? 'var(--accent-700)' : '#3F4651',
                      border: sel ? '1px solid var(--accent-200)' : '1px solid #D9DCE2',
                    }}>{t.name}</button>
                  );
                })}
              </div>
            </div>
          )}

          {allMethods.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Методології</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allMethods.map(t => {
                  const sel = selectedMethodIds.includes(t.id);
                  return (
                    <button key={t.id} onClick={() => toggleMethodTag(t.id)} style={{
                      padding: '5px 12px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                      borderRadius: 999, fontFamily: 'inherit', transition: 'all 120ms',
                      background: sel ? 'var(--accent-50)' : 'white',
                      color: sel ? 'var(--accent-700)' : '#3F4651',
                      border: sel ? '1px solid var(--accent-200)' : '1px solid #D9DCE2',
                    }}>{t.name}</button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Access tags */}
        <section style={card}>
          <h2 style={sectionTitle}>Доступність</h2>
          <p style={{ margin: '4px 0 14px', fontSize: 13, color: '#6B7280' }}>
            Вкажіть, чи маєте ви кваліфікацію для роботи з людьми з інвалідністю
          </p>

          <div style={{
            padding: 18, borderRadius: 12,
            background: hasAccess ? 'var(--accent-50)' : '#FAFBFC',
            border: `1px solid ${hasAccess ? 'var(--accent-200)' : '#E7E9EE'}`,
            transition: 'all 150ms',
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={hasAccess}
                onChange={e => { setHasAccess(e.target.checked); if (!e.target.checked) setSelectedAccessTagIds([]); }}
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

            {hasAccess && allDisabilityTags.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--accent-200)' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0F172A', marginBottom: 10 }}>
                  З якими типами працюєте
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {allDisabilityTags.map(t => {
                    const sel = selectedAccessTagIds.includes(t.id);
                    return (
                      <button key={t.id} onClick={() => toggleAccessTag(t.id)} style={{
                        padding: '5px 12px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                        borderRadius: 999, fontFamily: 'inherit', transition: 'all 120ms',
                        background: sel ? 'var(--accent-50)' : 'white',
                        color: sel ? 'var(--accent-700)' : '#3F4651',
                        border: sel ? '1px solid var(--accent-200)' : '1px solid #D9DCE2',
                      }}>{t.name}</button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Documents */}
        <section style={card}>
          <h2 style={sectionTitle}>Кваліфікаційні документи</h2>
          <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#6B7280' }}>
            Завантажте сертифікати для отримання мітки «Верифіковано». Документи перевіряються протягом 1–3 робочих днів.
          </p>

          {/* Document list */}
          {docsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[1, 2].map(i => (
                <div key={i} style={{ height: 58, borderRadius: 10, background: '#F8F9FB', border: '1px solid #E7E9EE' }} />
              ))}
            </div>
          ) : documents.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {documents.map(doc => {
                const isDeleting = deletingId === doc.id;
                return (
                  <div key={doc.id} style={{
                    border: '1px solid #E7E9EE', borderRadius: 10,
                    padding: '11px 14px',
                    background: doc.status === DocumentStatus.Rejected ? '#FFFBFA' : 'white',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* File icon */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                        background: '#F8F9FB', border: '1px solid #EDEFF3',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280',
                      }}>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1={16} y1={13} x2={8} y2={13} />
                          <line x1={16} y1={17} x2={8} y2={17} />
                        </svg>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.fileName}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 2 }}>
                          {DOC_TYPE_LABELS[doc.documentType]} · {formatBytes(doc.fileSizeBytes)}
                        </div>
                      </div>

                      <DocStatusBadge status={doc.status} />

                      {doc.status === DocumentStatus.Pending && (
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          disabled={isDeleting}
                          title="Видалити"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#9CA3AF', padding: 4, borderRadius: 6, flexShrink: 0,
                            opacity: isDeleting ? 0.4 : 1,
                          }}
                        >
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <line x1={6} y1={6} x2={18} y2={18} /><line x1={18} y1={6} x2={6} y2={18} />
                          </svg>
                        </button>
                      )}
                    </div>

                    {doc.status === DocumentStatus.Rejected && doc.rejectionReason && (
                      <div style={{
                        marginTop: 8, paddingTop: 8, borderTop: '1px solid #FECACA',
                        fontSize: 12.5, color: '#B91C1C', lineHeight: 1.5,
                      }}>
                        {doc.rejectionReason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload row */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto', gap: 10, alignItems: 'flex-end' }}>
            <FieldLabel label="Тип документа">
              <select value={docType} onChange={e => setDocType(Number(e.target.value) as DocumentType)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value={DocumentType.Certificate}>Сертифікат</option>
                <option value={DocumentType.Diploma}>Диплом</option>
                <option value={DocumentType.License}>Ліцензія</option>
                <option value={DocumentType.Other}>Інше</option>
              </select>
            </FieldLabel>
            <label style={{
              padding: '10px 14px', borderRadius: 9, border: '1.5px solid #E7E9EE',
              fontSize: 13.5, fontWeight: 500, cursor: 'pointer', color: '#3F4651',
              background: 'white', whiteSpace: 'nowrap', display: 'block',
              overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, boxSizing: 'border-box',
              textAlign: 'center',
            }}>
              {docFile ? docFile.name : 'Обрати файл'}
              <input type="file" accept=".pdf,image/jpeg,image/png" onChange={e => setDocFile(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
            </label>
            <button
              onClick={handleDocUpload}
              disabled={!docFile || isUploadingDoc}
              style={{ ...btnPrimary, opacity: !docFile || isUploadingDoc ? 0.6 : 1, whiteSpace: 'nowrap' }}
            >
              {isUploadingDoc ? 'Завантаження…' : 'Завантажити'}
            </button>
          </div>

          {docSuccess && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, fontSize: 13, color: '#047857' }}>
              Документ відправлено на перевірку
            </div>
          )}
          {docError && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#B91C1C' }}>
              {docError}
            </div>
          )}
        </section>

        {saveError && (
          <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 13, color: '#B91C1C' }}>
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, fontSize: 13, color: '#047857' }}>
            Зміни збережено
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={() => { setSaveError(null); setSaveSuccess(false); }}>Скасувати</button>
          <button style={{ ...btnPrimary, opacity: isSaving ? 0.7 : 1 }} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Збереження…' : 'Зберегти зміни'}
          </button>
        </div>
      </div>

    </div>
  );
}
