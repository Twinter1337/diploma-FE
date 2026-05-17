import { useRef, useState, useEffect } from 'react';
import Icon from '../ui/Icon';

interface AvatarUploadProps {
  avatarUrl: string;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  uploadError?: string | null;
}

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

function SpinnerIcon({ color = 'white' }: { color?: string }) {
  return (
    <>
      <style>{`.cc-spin{animation:cc-spin-kf .7s linear infinite}@keyframes cc-spin-kf{to{transform:rotate(360deg)}}`}</style>
      <svg
        className="cc-spin"
        width={22} height={22} viewBox="0 0 24 24"
        fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round"
      >
        <circle cx={12} cy={12} r={9} strokeOpacity={0.25} />
        <path d="M12 3a9 9 0 019 9" />
      </svg>
    </>
  );
}

export default function AvatarUpload({ avatarUrl, onUpload, isUploading = false, uploadError = null }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const blobRef = useRef<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (avatarUrl && blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
      setLocalPreview(null);
    }
  }, [avatarUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError('Дозволені лише JPG або PNG файли');
      return;
    }
    if (file.size > MAX_SIZE) {
      setLocalError('Файл не може перевищувати 10 МБ');
      return;
    }

    setLocalError(null);
    const preview = URL.createObjectURL(file);
    blobRef.current = preview;
    setLocalPreview(preview);
    await onUpload(file);
  };

  const displaySrc = localPreview ?? (avatarUrl || null);
  const hasPhoto = !!displaySrc;
  const displayError = localError ?? uploadError;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => { setLocalError(null); inputRef.current?.click(); }}
        disabled={isUploading}
        style={{
          position: 'relative', width: 120, height: 120, borderRadius: '50%',
          background: hasPhoto
            ? 'linear-gradient(135deg, hsl(18 55% 62%), hsl(53 65% 45%))'
            : '#F1F2F4',
          border: hasPhoto ? 'none' : '2px dashed #D9DCE2',
          cursor: isUploading ? 'not-allowed' : 'pointer', padding: 0, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 120ms',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => { if (!hasPhoto && !isUploading) e.currentTarget.style.borderColor = 'var(--accent-600)'; }}
        onMouseLeave={(e) => { if (!hasPhoto) e.currentTarget.style.borderColor = '#D9DCE2'; }}
      >
        {hasPhoto ? (
          <>
            <img src={displaySrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            {isUploading ? (
              <span style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <SpinnerIcon />
              </span>
            ) : (
              <span style={{
                position: 'absolute', bottom: 4, right: 4, width: 30, height: 30, borderRadius: '50%',
                background: 'white', border: '2px solid var(--accent-600)', color: 'var(--accent-700)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon d="M12 20h9|M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" size={13} />
              </span>
            )}
          </>
        ) : (
          isUploading ? (
            <SpinnerIcon color="#6B7280" />
          ) : (
            <span style={{ color: '#9CA3AF', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Icon d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z|M16 13a4 4 0 11-8 0 4 4 0 018 0z" size={28} stroke={1.6} />
              <span style={{ fontSize: 11, fontWeight: 500 }}>Завантажити</span>
            </span>
          )
        )}
      </button>
      <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>JPG або PNG, до 10 МБ</p>
      {displayError && (
        <p style={{ margin: 0, fontSize: 12, color: '#DC2626', textAlign: 'center', maxWidth: 180 }}>{displayError}</p>
      )}
    </div>
  );
}
