export default function LeftPanel() {
  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--auth-accent-700) 0%, #0F172A 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '48px 56px',
      minHeight: '100vh',
    }}>
      <div aria-hidden style={{
        position: 'absolute', top: '-15%', right: '-15%',
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--auth-accent-600) 0%, transparent 70%)',
        opacity: 0.55, filter: 'blur(20px)',
      }} />
      <div aria-hidden style={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)',
        opacity: 0.4, filter: 'blur(30px)',
      }} />

      <svg
        aria-hidden
        viewBox="0 0 600 800"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: 0.12, mixBlendMode: 'screen', pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id="authLg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.6" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[60, 130, 210, 300, 400, 510].map((r, i) => (
          <circle key={i} cx="500" cy="700" r={r} fill="none" stroke="url(#authLg1)" strokeWidth="1.5" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line key={i} x1={-100 + i * 90} y1="0" x2={100 + i * 90} y2="800" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
        ))}
      </svg>

      <div style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.25)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800, fontSize: 20, fontFamily: 'var(--auth-display)',
        }}>
          C
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'var(--auth-display)' }}>
          Coachly
        </span>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
        <h1 style={{
          margin: 0, fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em',
          lineHeight: 1.1, fontFamily: 'var(--auth-display)', color: 'white',
        }}>
          Знайди свого тренера.<br />
          <span style={{
            background: 'linear-gradient(90deg, #93C5FD, #C4B5FD)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Досягни своїх цілей.
          </span>
        </h1>
        <p style={{ margin: '20px 0 0', fontSize: 16.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
          Перша українська платформа, що поєднує клієнтів з кваліфікованими спортивними тренерами — включно з фахівцями для людей з інвалідністю.
        </p>
      </div>

      <div />
    </div>
  );
}
