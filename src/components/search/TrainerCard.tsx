import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TrainerSearchResult } from '../../types';
import { VerificationStatus } from '../../types';
import Icon from '../ui/Icon';

function idToHue(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

function StarFilled({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="currentColor"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  );
}

interface TrainerCardProps {
  trainer: TrainerSearchResult;
}

export default function TrainerCard({ trainer }: TrainerCardProps) {
  const [hover, setHover] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const hue = idToHue(trainer.id);
  const initials = [trainer.firstName, trainer.lastName].map(p => p[0]).join('');
  const isVerified = trainer.verificationStatus === VerificationStatus.Verified;
  const isAccessible = trainer.disabilityTags.length > 0;
  const showGradient = !trainer.avatarUrl || imgError;

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => navigate(`/trainer/${trainer.id}`)}
      style={{
        background: 'white',
        border: '1px solid #E7E9EE',
        borderRadius: 16,
        padding: 14,
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'all 180ms ease',
        boxShadow: hover
          ? '0 12px 28px -12px rgba(15, 23, 42, 0.18)'
          : '0 1px 2px rgba(15,23,42,0.03)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        cursor: 'pointer',
      }}
    >
      {/* Avatar */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '100%', aspectRatio: '1 / 1', borderRadius: 14,
          background: showGradient
            ? `linear-gradient(135deg, hsl(${hue} 55% 62%), hsl(${(hue + 35) % 360} 65% 45%))`
            : undefined,
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {!showGradient ? (
            <img
              src={trainer.avatarUrl!}
              alt={`${trainer.firstName} ${trainer.lastName}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <>
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(120% 80% at 50% 110%, rgba(0,0,0,.25), transparent 60%),
                             radial-gradient(60% 50% at 30% 25%, rgba(255,255,255,.35), transparent 70%)`,
              }} />
              <span style={{
                color: 'white', fontWeight: 700, fontSize: 44,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 12px rgba(0,0,0,.2)',
                fontFamily: 'var(--display)',
              }}>{initials}</span>
            </>
          )}
        </div>

        {isVerified && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(8px)',
            padding: '5px 9px 5px 7px', borderRadius: 999,
            fontSize: 11.5, fontWeight: 600, color: 'var(--accent-700)',
            boxShadow: '0 2px 8px rgba(15,23,42,.08)',
          }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.2 1.9 2.9-.3.8 2.8 2.6 1.4-1 2.7L20.5 13l-1 2.5 1 2.7-2.6 1.4-.8 2.8-2.9-.3L12 24l-2.2-1.9-2.9.3-.8-2.8-2.6-1.4 1-2.7L3.5 13l1-2.5-1-2.7 2.6-1.4.8-2.8 2.9.3L12 2z" />
              <path d="M8 12.5l2.5 2.5L16 9.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Верифіковано
          </div>
        )}

        {isAccessible && (
          <div
            title="Кваліфікація для роботи з особами з інвалідністю"
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 30, height: 30, borderRadius: 999,
              background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(8px)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-700)',
              boxShadow: '0 2px 8px rgba(15,23,42,.08)',
            }}
          >
            <Icon
              d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 13l-4 0-1-3-3 0 0 5 5 0 1 6M11 12a4 4 0 1 0 4 6"
              size={16}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <h3 style={{
            margin: 0, fontSize: 16.5, fontWeight: 600, color: '#0F172A',
            letterSpacing: '-0.01em', lineHeight: 1.3,
          }}>{trainer.firstName} {trainer.lastName}</h3>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ color: '#F5A524', display: 'inline-flex' }}><StarFilled size={14} /></span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>{trainer.rating.toFixed(1)}</span>
            <span style={{ fontSize: 12.5, color: '#6B7280' }}>({trainer.reviewsCount})</span>
          </div>
        </div>

        {trainer.specializationTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {trainer.specializationTags.map(tag => (
              <span key={tag.id} style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '3px 9px', fontSize: 12, fontWeight: 500,
                borderRadius: 999, lineHeight: 1.4,
                background: '#F1F2F4', color: '#3F4651',
                border: '1px solid transparent', whiteSpace: 'nowrap',
              }}>{tag.name}</span>
            ))}
          </div>
        )}

        {trainer.city && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
            <Icon d="M12 21s-7-7.5-7-13a7 7 0 1114 0c0 5.5-7 13-7 13z M12 11a2 2 0 100-4 2 2 0 000 4z" size={14} />
            {trainer.city}
          </div>
        )}

        {trainer.minPrice != null && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>від</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
              {trainer.minPrice}
            </span>
            <span style={{ fontSize: 13, color: '#6B7280' }}>грн / заняття</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={e => { e.stopPropagation(); navigate(`/trainer/${trainer.id}`); }}
        style={{
          width: '100%', padding: '10px 14px',
          background: hover ? 'var(--accent-600)' : 'white',
          color: hover ? 'white' : 'var(--accent-700)',
          border: `1.5px solid ${hover ? 'var(--accent-600)' : 'var(--accent-200)'}`,
          borderRadius: 10, fontSize: 13.5, fontWeight: 600,
          cursor: 'pointer', transition: 'all 160ms ease',
          fontFamily: 'inherit',
        }}
      >
        Переглянути профіль
      </button>
    </article>
  );
}
