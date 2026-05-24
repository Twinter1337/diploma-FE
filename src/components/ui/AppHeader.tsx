import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import Icon from './Icon';
import { useIsMobile } from '../../hooks/useWindowWidth';

const CHEVRON_DOWN = 'M6 9l6 6 6-6';

const navLink: React.CSSProperties = {
  fontSize: 13.5, color: '#3F4651', textDecoration: 'none',
  fontWeight: 500, padding: '6px 0', transition: 'color 150ms',
};

const menuItem: React.CSSProperties = {
  display: 'block', width: '100%', padding: '10px 16px',
  background: 'transparent', border: 'none', textAlign: 'left',
  fontSize: 13.5, fontWeight: 500, color: '#0F172A', cursor: 'pointer',
  fontFamily: 'inherit', transition: 'background 120ms',
};

export default function AppHeader() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '';

  const profilePath = user?.role === 1 ? '/trainer' : '/dashboard';
  const homePath = user?.role === 1 ? '/trainer' : user?.role === 2 ? '/admin' : '/search';
  const handleProfile = () => { setIsOpen(false); navigate(profilePath); };
  const handleLogout = () => { setIsOpen(false); logout(); navigate('/auth'); };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E7E9EE',
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto', padding: isMobile ? '12px 16px' : '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to={homePath} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'var(--accent-600)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 17,
            fontFamily: 'var(--display)',
            boxShadow: '0 2px 8px var(--accent-shadow)',
          }}>C</div>
          <span style={{
            fontSize: 19, fontWeight: 700, color: '#0F172A',
            letterSpacing: '-0.02em', fontFamily: 'var(--display)',
          }}>Coachly</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {user?.role !== 1 && user?.role !== 2 && (
            <Link to="/search" style={navLink}
              onMouseEnter={e => (e.currentTarget.style.color = '#0F172A')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3F4651')}
            >Знайти тренера</Link>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 12px 5px 5px',
                  border: '1.5px solid #E7E9EE', borderRadius: 100,
                  background: 'white', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'border-color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#D1D5DB')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E7E9EE')}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.firstName}
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #9333EA 0%, #C084FC 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>{initials}</div>
                )}
                {!isMobile && (
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: '#0F172A' }}>
                    {user.firstName}
                  </span>
                )}
                <span style={{
                  color: '#9CA3AF',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms',
                  display: 'flex',
                }}>
                  <Icon d={CHEVRON_DOWN} size={16} stroke={2} />
                </span>
              </button>

              {isOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  minWidth: 160, background: 'white',
                  border: '1px solid #E7E9EE', borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                  overflow: 'hidden',
                }}>
                  <button
                    type="button"
                    style={menuItem}
                    onClick={handleProfile}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >Профіль</button>
                  <div style={{ height: 1, background: '#F1F5F9', margin: '0 12px' }} />
                  <button
                    type="button"
                    style={{ ...menuItem, color: '#EF4444' }}
                    onClick={handleLogout}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FFF5F5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >Вийти</button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/auth')}
              style={{
                padding: '9px 18px', background: 'var(--accent-600)',
                border: 'none', color: 'white', borderRadius: 9,
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 2px 8px var(--accent-shadow)',
                transition: 'background 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-700)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-600)')}
            >Увійти</button>
          )}
        </div>
      </div>
    </header>
  );
}
