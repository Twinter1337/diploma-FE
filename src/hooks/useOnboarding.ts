import { useState, useEffect, useCallback } from 'react';
import type { Gender, Tag } from '../types';
import { useAuthContext } from '../contexts/AuthContext';
import * as clientService from '../services/clientService';
import * as userService from '../services/userService';

export interface Step1Fields {
  avatarUrl: string;
  city: string;
  about: string;
}

export interface Step2Fields {
  heightCm: string;
  weightKg: string;
  gender: Gender | null;
  birthDate: string;
  accessTagIds: number[];
  accessibilityEnabled: boolean;
  goalPills: string[];
}

const INITIAL_STEP1: Step1Fields = { avatarUrl: '', city: '', about: '' };
const INITIAL_STEP2: Step2Fields = {
  heightCm: '',
  weightKg: '',
  gender: null,
  birthDate: '',
  accessTagIds: [],
  accessibilityEnabled: false,
  goalPills: [],
};

export function useOnboarding() {
  const { user } = useAuthContext();

  const [step1, setStep1State] = useState<Step1Fields>(INITIAL_STEP1);
  const [step2, setStep2State] = useState<Step2Fields>(INITIAL_STEP2);
  const [disabilityTags, setDisabilityTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadAvatarError, setUploadAvatarError] = useState<string | null>(null);

  const setStep1 = (partial: Partial<Step1Fields>) =>
    setStep1State((prev) => ({ ...prev, ...partial }));

  const setStep2 = (partial: Partial<Step2Fields>) =>
    setStep2State((prev) => ({ ...prev, ...partial }));

  const fetchTags = useCallback(async () => {
    setTagsLoading(true);
    setTagsError(null);
    try {
      const tags = await clientService.getDisabilityTags();
      setDisabilityTags(tags);
    } catch (err) {
      setTagsError(err instanceof Error ? err.message : 'Не вдалося завантажити список тегів. Спробуйте ще раз.');
    } finally {
      setTagsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const uploadAvatar = async (file: File): Promise<void> => {
    if (!user) { setUploadAvatarError('Сесія закінчилась. Увійдіть знову.'); return; }
    setIsUploadingAvatar(true);
    setUploadAvatarError(null);
    try {
      const { avatarUrl } = await userService.uploadAvatar(user.id, file);
      setStep1({ avatarUrl });
    } catch (err) {
      setUploadAvatarError(err instanceof Error ? err.message : 'Не вдалося завантажити фото. Спробуйте ще раз.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const submitStep1 = async (): Promise<boolean> => {
    if (!user) {
      setError('Сесія закінчилась. Увійдіть знову.');
      return false;
    }
    if (!step1.city) {
      setError('Оберіть місто');
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      await clientService.patchClientStep1(user.id, {
        avatarUrl: step1.avatarUrl,
        city: step1.city,
        about: step1.about,
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти. Спробуйте ще раз.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const submitStep2 = async (): Promise<boolean> => {
    if (!user) {
      setError('Сесія закінчилась. Увійдіть знову.');
      return false;
    }
    const heightCm = parseFloat(step2.heightCm);
    const weightKg = parseFloat(step2.weightKg);
    if (isNaN(heightCm) || heightCm < 50 || heightCm > 300) {
      setError('Зріст має бути від 50 до 300 см');
      return false;
    }
    if (isNaN(weightKg) || weightKg < 1 || weightKg > 500) {
      setError('Вага має бути від 1 до 500 кг');
      return false;
    }
    if (step2.gender === null) {
      setError('Оберіть стать');
      return false;
    }
    if (!step2.birthDate) {
      setError('Введіть дату народження');
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      await clientService.patchClientStep2(user.id, {
        heightCm,
        weightKg,
        gender: step2.gender,
        birthDate: step2.birthDate,
        accessTagIds: step2.accessibilityEnabled ? step2.accessTagIds : [],
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти. Спробуйте ще раз.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step1,
    step2,
    setStep1,
    setStep2,
    disabilityTags,
    tagsLoading,
    tagsError,
    retryTags: fetchTags,
    isLoading,
    error,
    clearError: () => setError(null),
    uploadAvatar,
    isUploadingAvatar,
    uploadAvatarError,
    submitStep1,
    submitStep2,
  };
}
