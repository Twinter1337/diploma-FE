import { useState } from 'react';
import AppHeader from '../components/ui/AppHeader';
import { useAuthContext } from '../contexts/AuthContext';
import { useIsMobile } from '../hooks/useWindowWidth';
import { useTrainerDashboard } from '../hooks/useTrainerDashboard';
import { useTrainerProfile } from '../hooks/useTrainerProfile';
import ScheduleTab from '../components/trainer-dashboard/ScheduleTab';
import BookingsTab from '../components/trainer-dashboard/BookingsTab';
import ClientsTab from '../components/trainer-dashboard/ClientsTab';
import StatsTab from '../components/trainer-dashboard/StatsTab';
import TrainerSettingsTab from '../components/trainer-dashboard/TrainerSettingsTab';
import NewSlotModal from '../components/trainer-dashboard/NewSlotModal';

type TabId = 'schedule' | 'bookings' | 'clients' | 'stats' | 'settings';

interface TabDef {
  id: TabId;
  label: string;
  count?: number;
}

export default function TrainerDashboardPage() {
  const { user } = useAuthContext();
  const trainerId = user?.id ?? '';
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabId>('schedule');

  const [showNewSlot, setShowNewSlot] = useState(false);

  const { slots, slotCount, bookings, clients, stats, reviews, isLoading, error, setSlotFilters, updateSlot, createSlot, deleteSlot } =
    useTrainerDashboard(trainerId);

  const { profile, isLoading: profileLoading, refetchProfile } = useTrainerProfile(trainerId);

  const tabs: TabDef[] = [
    { id: 'schedule', label: 'Розклад', count: slots.length || undefined },
    { id: 'bookings', label: 'Бронювання', count: bookings.length || undefined },
    { id: 'clients', label: 'Клієнти', count: clients.length || undefined },
    { id: 'stats', label: 'Статистика' },
    { id: 'settings', label: 'Налаштування профілю' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB' }}>
      <AppHeader />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '16px 16px 48px' : '32px 32px 64px' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{
              margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 700, color: '#0F172A',
              letterSpacing: '-0.025em', fontFamily: 'var(--display)',
            }}>
              Привіт, {user?.firstName ?? ''} 👋
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 14.5, color: '#6B7280' }}>
              Кабінет тренера
            </p>
          </div>
          <button
            onClick={() => setShowNewSlot(true)}
            style={{
              padding: '10px 18px', background: 'var(--accent-600)', color: 'white',
              border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 2px 8px var(--accent-shadow)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <line x1={12} y1={5} x2={12} y2={19} /><line x1={5} y1={12} x2={19} y2={12} />
            </svg>
            Новий слот
          </button>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 24,
          borderBottom: '1px solid #E7E9EE',
          overflowX: 'auto',
        }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 16px', fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  background: 'transparent', border: 'none',
                  color: active ? 'var(--accent-700)' : '#6B7280',
                  borderBottom: active ? '2px solid var(--accent-600)' : '2px solid transparent',
                  marginBottom: -1,
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  transition: 'color 120ms',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: 20, height: 20, padding: '0 6px',
                    background: active ? 'var(--accent-600)' : '#E7E9EE',
                    color: active ? 'white' : '#6B7280',
                    borderRadius: 999, fontSize: 11, fontWeight: 700,
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'schedule' && (
          <ScheduleTab
            slots={slots}
            slotCount={slotCount}
            isLoading={isLoading}
            error={error}
            onUpdateSlot={updateSlot}
            onDeleteSlot={deleteSlot}
            onFiltersChange={setSlotFilters}
          />
        )}
        {activeTab === 'bookings' && (
          <BookingsTab
            bookings={bookings}
            isLoading={isLoading}
            error={error}
          />
        )}
        {activeTab === 'clients' && (
          <ClientsTab
            clients={clients}
            trainerId={trainerId}
            currentUserId={trainerId}
            isLoading={isLoading}
            error={error}
          />
        )}
        {activeTab === 'stats' && (
          <StatsTab
            stats={stats}
            reviews={reviews}
            isLoading={isLoading}
            error={error}
          />
        )}
        {activeTab === 'settings' && (
          <TrainerSettingsTab
            trainerId={trainerId}
            profile={profile}
            isLoading={profileLoading}
            onSaved={refetchProfile}
          />
        )}
      </main>

      {showNewSlot && (
        <NewSlotModal
          onClose={() => setShowNewSlot(false)}
          onSubmit={createSlot}
        />
      )}
    </div>
  );
}
