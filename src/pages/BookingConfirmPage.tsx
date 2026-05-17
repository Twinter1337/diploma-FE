import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import type { ScheduleSlot, BookingTrainerSummary } from '../types';
import { useCreateBooking } from '../hooks/useBooking';
import SessionDetails from '../components/booking/SessionDetails';
import ReminderSection from '../components/booking/ReminderSection';
import OrderSummary, { calcServiceFee } from '../components/booking/OrderSummary';
import Icon from '../components/ui/Icon';

interface BookingPageState {
  slot: ScheduleSlot;
  trainer: BookingTrainerSummary;
}

function isBookingPageState(s: unknown): s is BookingPageState {
  return (
    s !== null &&
    typeof s === 'object' &&
    'slot' in s &&
    'trainer' in s
  );
}

function BookingSteps() {
  const steps = ['Тренер', 'Дата і час', 'Підтвердження', 'Оплата'];
  const current = 2;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  background: done ? 'var(--accent-600)' : active ? 'var(--accent-50)' : '#F1F2F4',
                  color: done ? 'white' : active ? 'var(--accent-700)' : '#9CA3AF',
                  border: active ? '1.5px solid var(--accent-600)' : 'none',
                }}
              >
                {done ? <Icon d="M5 12l5 5 9-11" size={12} stroke={2.5} /> : i + 1}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? '#0F172A' : done ? '#3F4651' : '#9CA3AF',
                }}
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span style={{ width: 24, height: 1, background: done ? 'var(--accent-600)' : '#E7E9EE' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PolicyCard() {
  return (
    <section
      style={{
        background: '#FAFBFC',
        border: '1px solid #E7E9EE',
        borderRadius: 16,
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', gap: 14 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'var(--accent-50)',
            color: 'var(--accent-700)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon d="M12 8v4|M12 16h.01|M3 12a9 9 0 1118 0 9 9 0 01-18 0z" size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em' }}>
            Політика скасування
          </h3>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#3F4651', lineHeight: 1.6 }}>
            Безкоштовне скасування за <strong style={{ color: '#0F172A' }}>24 години</strong> до
            початку заняття. Після цього повертається{' '}
            <strong style={{ color: '#0F172A' }}>50% вартості</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function BookingConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { create, isLoading, error } = useCreateBooking();
  const [reminder, setReminder] = useState(60);

  const state = location.state;
  if (!isBookingPageState(state)) {
    navigate('/search', { replace: true });
    return null;
  }

  const { slot, trainer } = state;

  const handlePay = async () => {
    const reminderMinutes = reminder > 0 ? reminder : undefined;
    const fee = calcServiceFee(slot.price);
    const result = await create(slot.id, fee, slot.price + fee, reminderMinutes);
    if (result) {
      window.location.href = result.checkoutUrl;
    }
  };

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #E7E9EE' }}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '14px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to="/search"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: 'var(--accent-600)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: 17,
                fontFamily: 'var(--display)',
              }}
            >
              C
            </div>
            <span
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--display)',
              }}
            >
              Coachly
            </span>
          </Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
            Захищене з'єднання
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 64px' }}>
        <Link
          to="/search"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: '#6B7280',
            textDecoration: 'none',
            marginBottom: 14,
          }}
        >
          <Icon d="M15 6l-6 6 6 6" size={14} />
          Назад до пошуку
        </Link>

        <h1
          style={{
            margin: '0 0 6px',
            fontSize: 30,
            fontWeight: 700,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            fontFamily: 'var(--display)',
          }}
        >
          Підтвердження бронювання
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 14.5, color: '#6B7280' }}>
          Перевірте деталі заняття перед оплатою
        </p>

        <BookingSteps />

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 10,
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: 13.5,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: 24,
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <SessionDetails slot={slot} trainer={trainer} />
            <ReminderSection value={reminder} onChange={setReminder} />
            <PolicyCard />
          </div>
          <OrderSummary slot={slot} trainer={trainer} isLoading={isLoading} onPay={handlePay} />
        </div>
      </main>
    </div>
  );
}
