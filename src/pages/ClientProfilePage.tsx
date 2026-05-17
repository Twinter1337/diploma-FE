import { useState } from 'react';
import AppHeader from '../components/ui/AppHeader';
import { useAuthContext } from '../contexts/AuthContext';
import { useClientDashboard } from '../hooks/useClientDashboard';
import UpcomingTab from '../components/dashboard/UpcomingTab';
import HistoryTab from '../components/dashboard/HistoryTab';
import AchievementsTab from '../components/dashboard/AchievementsTab';
import SettingsTab from '../components/dashboard/SettingsTab';

type TabId = 'upcoming' | 'history' | 'achievements' | 'settings';

interface TabDef {
  id: TabId;
  label: string;
  count?: number;
}

export default function ClientProfilePage() {
  const { user } = useAuthContext();
  const isAdmin = user?.role === 2;
  const [activeTab, setActiveTab] = useState<TabId>(isAdmin ? 'settings' : 'upcoming');

  const {
    profile, profileLoading,
    bookings, bookingsLoading, bookingsError,
    history, historyLoading, historyError,
    achievements, achievementsLoading, achievementsError,
    isSaving, saveError, saveSuccess,
    isUploadingAvatar,
    isDeletingAvatar,
    cancellingId,
    retryingPaymentId,
    lateFeeCheckout,
    isDeletingAccount,
    uploadAvatar,
    deleteAvatar,
    saveSettings,
    submitReview,
    cancelBooking,
    retryPayment,
    confirmLateFeePayment,
    dismissLateFeeWarning,
    deleteAccount,
    clearSaveError,
  } = useClientDashboard();

  const tabs: TabDef[] = isAdmin
    ? [{ id: 'settings', label: 'Налаштування профілю' }]
    : [
        { id: 'upcoming', label: 'Майбутні заняття', count: bookings.length || undefined },
        { id: 'history', label: 'Історія занять', count: history.length || undefined },
        { id: 'achievements', label: 'Досягнення' },
        { id: 'settings', label: 'Налаштування профілю' },
      ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB' }}>
      <AppHeader />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 64px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            margin: 0, fontSize: 28, fontWeight: 700, color: '#0F172A',
            letterSpacing: '-0.025em', fontFamily: 'var(--display)',
          }}>
            Привіт, {user?.firstName ?? profile?.firstName ?? ''}! 👋
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14.5, color: '#6B7280' }}>
            Ваш персональний кабінет на Coachly
          </p>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 24,
          borderBottom: '1px solid #E7E9EE',
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

        {activeTab === 'upcoming' && (
          <UpcomingTab
            bookings={bookings}
            isLoading={bookingsLoading}
            error={bookingsError}
            cancellingId={cancellingId}
            retryingPaymentId={retryingPaymentId}
            lateFeeCheckout={lateFeeCheckout}
            onCancelBooking={cancelBooking}
            onRetryPayment={retryPayment}
            onConfirmLateFee={confirmLateFeePayment}
            onDismissLateFee={dismissLateFeeWarning}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab
            history={history}
            isLoading={historyLoading}
            error={historyError}
            currentUserId={user?.id ?? ''}
            onSubmitReview={submitReview}
          />
        )}
        {activeTab === 'achievements' && (
          <AchievementsTab
            data={achievements}
            isLoading={achievementsLoading}
            error={achievementsError}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            profile={profile}
            isLoading={profileLoading}
            isSaving={isSaving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            isUploadingAvatar={isUploadingAvatar}
            isDeletingAvatar={isDeletingAvatar}
            isDeletingAccount={isDeletingAccount}
            onSave={saveSettings}
            onAvatarUpload={uploadAvatar}
            onAvatarDelete={deleteAvatar}
            onDeleteAccount={deleteAccount}
            onClearError={clearSaveError}
          />
        )}
      </main>
    </div>
  );
}
