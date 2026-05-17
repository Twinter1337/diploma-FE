import { useRef, useState } from 'react';
import type { TrainerStep3DocForm } from '../../../hooks/useTrainerOnboarding';
import type { TrainerDocumentResponse } from '../../../services/trainerService';
import { DocumentType } from '../../../types';
import SelectInput from '../SelectInput';
import Icon from '../../ui/Icon';

const DOC_TYPE_OPTIONS = [
  { value: String(DocumentType.Certificate), label: 'Сертифікат' },
  { value: String(DocumentType.Diploma), label: 'Диплом' },
  { value: String(DocumentType.License), label: 'Ліцензія' },
  { value: String(DocumentType.Other), label: 'Інше' },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

interface TrainerStepThreeProps {
  addedDocs: TrainerDocumentResponse[];
  onSubmitDoc: (doc: TrainerStep3DocForm) => Promise<boolean>;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export default function TrainerStepThree({
  addedDocs, onSubmitDoc, onNext, onSkip, onBack, isLoading, error, onClearError,
}: TrainerStepThreeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TrainerStep3DocForm>({
    file: null,
    documentType: DocumentType.Certificate,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onClearError();
    const picked = e.target.files?.[0] ?? null;
    setForm((f) => ({ ...f, file: picked }));
    e.target.value = '';
  };

  const handleSaveDoc = async () => {
    const ok = await onSubmitDoc(form);
    if (ok) {
      setForm({ file: null, documentType: DocumentType.Certificate });
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm({ file: null, documentType: DocumentType.Certificate });
    onClearError();
  };

  return (
    <>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.025em', fontFamily: 'var(--display)' }}>
          Кваліфікаційні документи
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 14.5, color: '#6B7280', lineHeight: 1.55 }}>
          Завантажте сертифікати та дипломи — адміністратор перевірить їх протягом 1–3 робочих днів
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            style={{
              border: `2px dashed ${addedDocs.length ? 'var(--accent-200)' : '#D9DCE2'}`,
              borderRadius: 14, padding: '36px 24px', textAlign: 'center',
              background: addedDocs.length ? 'var(--accent-50)' : '#FAFBFC',
              cursor: 'pointer', fontFamily: 'inherit', width: '100%',
              transition: 'all 150ms',
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
              background: 'var(--accent-600)', color: 'white',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4|M17 8l-5-5-5 5|M12 3v12" size={22} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
              Додати документ
            </div>
            <div style={{ fontSize: 12.5, color: '#6B7280' }}>PDF, JPG, PNG · до 10 МБ</div>
          </button>
        )}

        {showForm && (
          <div style={{ padding: 18, borderRadius: 12, background: '#FAFBFC', border: '1px solid #E7E9EE' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Новий документ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {/* File picker area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                  Файл <span style={{ color: '#DC2626' }}>*</span>
                </label>
                {form.file ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid var(--accent-200)', background: 'var(--accent-50)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 7, background: 'white', border: '1px solid #EDEFF3', color: '#6B7280', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z|M14 2v6h6" size={15} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{form.file.name}</div>
                        <div style={{ fontSize: 11.5, color: '#6B7280' }}>{formatBytes(form.file.size)}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { onClearError(); setForm((f) => ({ ...f, file: null })); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}
                      aria-label="Видалити файл"
                    >
                      <Icon d="M18 6L6 18|M6 6l12 12" size={15} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10,
                      border: '1.5px dashed #D9DCE2', background: 'white',
                      fontSize: 13.5, color: '#6B7280', fontFamily: 'inherit',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'border-color 150ms',
                    }}
                  >
                    <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4|M17 8l-5-5-5 5|M12 3v12" size={15} />
                    Обрати файл (PDF, JPG, PNG · до 10 МБ)
                  </button>
                )}
              </div>

              <SelectInput
                label="Тип документу"
                required
                value={String(form.documentType)}
                onChange={(v) => setForm((f) => ({ ...f, documentType: parseInt(v) as DocumentType }))}
                options={DOC_TYPE_OPTIONS}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '9px 16px', background: 'white', color: '#3F4651',
                  border: '1.5px solid #E7E9EE', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handleSaveDoc}
                disabled={isLoading || !form.file}
                style={{
                  padding: '9px 18px', background: 'var(--accent-600)', color: 'white',
                  border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                  cursor: isLoading || !form.file ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  opacity: isLoading || !form.file ? 0.6 : 1,
                  transition: 'opacity 120ms',
                }}
              >
                {isLoading ? 'Завантаження…' : 'Завантажити'}
              </button>
            </div>
          </div>
        )}

        {addedDocs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {addedDocs.map((d) => (
              <div key={d.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 10, border: '1px solid #E7E9EE', background: 'white',
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FAFBFC', border: '1px solid #EDEFF3', color: '#6B7280', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z|M14 2v6h6" size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>{d.fileName}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                      {DOC_TYPE_OPTIONS[d.documentType]?.label ?? ''} · {formatBytes(d.fileSizeBytes)}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--accent-50)', color: 'var(--accent-700)' }}>
                  На перевірці
                </span>
              </div>
            ))}
            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                style={{
                  padding: '10px 14px', background: 'white', color: 'var(--accent-700)',
                  border: '1.5px dashed var(--accent-200)', borderRadius: 10,
                  fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                + Додати ще один документ
              </button>
            )}
          </div>
        )}

        <div style={{
          padding: 16, borderRadius: 12,
          background: '#FFFBEB', border: '1px solid #FDE68A',
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <Icon d="M12 9v2m0 4h.01|M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.34 16a2 2 0 001.73 3z" size={18} />
          <div style={{ fontSize: 13, color: '#78350F', lineHeight: 1.55 }}>
            Документи перевіряє адміністратор протягом 1–3 робочих днів. Після верифікації ваш профіль отримає мітку «Верифіковано».
          </div>
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

          <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center' }}>
            <button
              type="button"
              onClick={onSkip}
              style={{
                background: 'transparent', border: 'none', color: '#6B7280',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                textDecoration: 'underline',
              }}
            >
              Пропустити
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
              Далі
              <Icon d="M9 6l6 6-6 6" size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
