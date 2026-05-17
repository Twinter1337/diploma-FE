import Icon from '../ui/Icon';

const EYE_OPEN = 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z|M12 15a3 3 0 100-6 3 3 0 000 6z';
const EYE_CLOSED = 'M3 3l18 18|M10.6 10.6a2 2 0 002.8 2.8|M6.7 6.7C4.6 8 3 10 2 12c1.7 3.3 5.5 6 10 6 1.6 0 3.1-.3 4.5-.9|M14 5.2c1 .2 1.9.5 2.7.9 2.5 1.3 4.4 3.3 5.3 5.9-.4 1-1 2-1.7 2.8';

interface EyeToggleProps {
  show: boolean;
  onToggle: () => void;
}

export default function EyeToggle({ show, onToggle }: EyeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? 'Сховати пароль' : 'Показати пароль'}
      style={{
        width: 32, height: 32, borderRadius: 7,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: '#6B7280', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Icon d={show ? EYE_CLOSED : EYE_OPEN} size={17} />
    </button>
  );
}
