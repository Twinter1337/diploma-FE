export default function DashboardPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FB' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 13, background: 'var(--accent-600)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800, fontSize: 24, fontFamily: 'var(--display)',
          marginBottom: 16,
        }}>C</div>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: '#0F172A', fontFamily: 'var(--display)' }}>
          Ласкаво просимо до Coachly!
        </h1>
        <p style={{ margin: 0, color: '#6B7280', fontSize: 15 }}>Dashboard — coming soon</p>
      </div>
    </div>
  );
}
