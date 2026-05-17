interface Props {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Avatar({ name, avatarUrl, size = 28 }: Props) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--accent-100, #DBEAFE)',
        color: 'var(--accent-700, #1D4ED8)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(10, Math.round(size * 0.4)),
        fontWeight: 700,
        flexShrink: 0,
        fontFamily: 'var(--display, "Plus Jakarta Sans")',
        letterSpacing: '-0.01em',
      }}
    >
      {initials(name)}
    </span>
  );
}
