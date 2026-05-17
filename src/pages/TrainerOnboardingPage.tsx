import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';
import { useTrainerOnboarding } from '../hooks/useTrainerOnboarding';
import StepIndicator from '../components/onboarding/StepIndicator';
import TrainerStepOne from '../components/onboarding/trainer/TrainerStepOne';
import TrainerStepTwo from '../components/onboarding/trainer/TrainerStepTwo';
import TrainerStepThree from '../components/onboarding/trainer/TrainerStepThree';
import TrainerStepFour from '../components/onboarding/trainer/TrainerStepFour';

const STEP_LABELS = ['Основна', 'Професійна', 'Документи', 'Розклад'];

const stepVariants = {
  enter: (dir: number) => ({ x: dir * 52, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -52, opacity: 0 }),
};

const stepTransition = { duration: 0.26, ease: [0.25, 0.1, 0.25, 1] as const };

export default function TrainerOnboardingPage() {
  const { isAuthenticated, isRestoring, user } = useAuthContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const {
    step1, step2, addedDocs, addedSlots,
    setStep1, setStep2,
    specializationTags, methodologyTags, disabilityTags,
    tagsLoading, tagsError, retryTags,
    isLoading, error, clearError,
    uploadAvatar, isUploadingAvatar, uploadAvatarError,
    submitStep1, submitStep2, submitDocument, submitSlot,
  } = useTrainerOnboarding();

  if (isRestoring) return null;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleStep1Next = async () => {
    const ok = await submitStep1();
    if (ok) goTo(2);
  };

  const handleStep2Next = async () => {
    const ok = await submitStep2();
    if (ok) goTo(3);
  };

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh' }}>
      <header style={{
        borderBottom: '1px solid #E7E9EE', background: 'white',
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: 'var(--accent-600)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 17, fontFamily: 'var(--display)',
          }}>C</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', fontFamily: 'var(--display)' }}>
            Coachly
          </span>
        </div>
        {user && (
          <span style={{ fontSize: 13.5, color: '#6B7280', fontWeight: 500 }}>
            {user.firstName} {user.lastName}
          </span>
        )}
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '44px 32px 80px' }}>
        <StepIndicator currentStep={step} labels={STEP_LABELS} />

        <div style={{
          background: 'white', borderRadius: 16, border: '1px solid #E7E9EE',
          overflow: 'hidden',
        }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              style={{ padding: '36px 40px' }}
            >
              {step === 1 && (
                <TrainerStepOne
                  fields={step1}
                  onChange={setStep1}
                  onNext={handleStep1Next}
                  isLoading={isLoading}
                  error={error}
                  onClearError={clearError}
                  onUploadAvatar={uploadAvatar}
                  isUploadingAvatar={isUploadingAvatar}
                  uploadAvatarError={uploadAvatarError}
                />
              )}
              {step === 2 && (
                <TrainerStepTwo
                  fields={step2}
                  onChange={setStep2}
                  specializationTags={specializationTags}
                  methodologyTags={methodologyTags}
                  disabilityTags={disabilityTags}
                  tagsLoading={tagsLoading}
                  tagsError={tagsError}
                  onRetryTags={retryTags}
                  onNext={handleStep2Next}
                  onBack={() => goTo(1)}
                  isLoading={isLoading}
                  error={error}
                  onClearError={clearError}
                />
              )}
              {step === 3 && (
                <TrainerStepThree
                  addedDocs={addedDocs}
                  onSubmitDoc={submitDocument}
                  onNext={() => goTo(4)}
                  onSkip={() => goTo(4)}
                  onBack={() => goTo(2)}
                  isLoading={isLoading}
                  error={error}
                  onClearError={clearError}
                />
              )}
              {step === 4 && (
                <TrainerStepFour
                  addedSlots={addedSlots}
                  onSubmitSlot={submitSlot}
                  onFinish={() => navigate('/trainer')}
                  onBack={() => goTo(3)}
                  isLoading={isLoading}
                  error={error}
                  onClearError={clearError}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
