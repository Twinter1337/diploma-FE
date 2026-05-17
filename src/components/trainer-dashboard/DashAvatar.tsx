interface DashAvatarProps {
  name: string;
  size: number;
  avatarUrl?: string | null;
}

function nameHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % 360;
  return h;
}

export default function DashAvatar({ name, size, avatarUrl }: DashAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
      />
    );
  }
  const hue = nameHue(name);
  const initials = name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},70%,55%) 0%, hsl(${(hue + 40) % 360},65%,70%) 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: size * 0.3, fontWeight: 700,
    }}>
      {initials}
    </div>
  );
}
