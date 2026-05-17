import { useState, useEffect, useCallback } from 'react';
import type { Gender, Tag } from '../types';
import { SlotFormat, DocumentType } from '../types';
import { useAuthContext } from '../contexts/AuthContext';
import * as trainerService from '../services/trainerService';
import * as userService from '../services/userService';
import type { TrainerDocumentResponse, TrainerSlotResponse } from '../services/trainerService';

export interface TrainerStep1Fields {
  avatarUrl: string;
  city: string;
  gender: Gender | null;
  birthDate: string;
  bio: string;
}

export interface TrainerStep2Fields {
  experienceYears: string;
  specializationTagIds: number[];
  methodologyTagIds: number[];
  hasAccess: boolean;
  accessTagIds: number[];
}

export interface TrainerStep3DocForm {
  file: File | null;
  documentType: DocumentType;
}

export interface TrainerStep4SlotForm {
  date: string;
  startTime: string;
  endTime: string;
  format: SlotFormat;
  pricePerSession: string;
  maxClients: string;
}

const INITIAL_STEP1: TrainerStep1Fields = {
  avatarUrl: '', city: '', gender: null, birthDate: '', bio: '',
};

const INITIAL_STEP2: TrainerStep2Fields = {
  experienceYears: '',
  specializationTagIds: [],
  methodologyTagIds: [],
  hasAccess: false,
  accessTagIds: [],
};

export function useTrainerOnboarding() {
  const { user } = useAuthContext();

  const [step1, setStep1State] = useState<TrainerStep1Fields>(INITIAL_STEP1);
  const [step2, setStep2State] = useState<TrainerStep2Fields>(INITIAL_STEP2);
  const [addedDocs, setAddedDocs] = useState<TrainerDocumentResponse[]>([]);
  const [addedSlots, setAddedSlots] = useState<TrainerSlotResponse[]>([]);

  const [specializationTags, setSpecializationTags] = useState<Tag[]>([]);
  const [methodologyTags, setMethodologyTags] = useState<Tag[]>([]);
  const [disabilityTags, setDisabilityTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadAvatarError, setUploadAvatarError] = useState<string | null>(null);

  const setStep1 = (partial: Partial<TrainerStep1Fields>) =>
    setStep1State((prev) => ({ ...prev, ...partial }));

  const setStep2 = (partial: Partial<TrainerStep2Fields>) =>
    setStep2State((prev) => ({ ...prev, ...partial }));

  const fetchTags = useCallback(async () => {
    setTagsLoading(true);
    setTagsError(null);
    try {
      const [specs, methods, disability] = await Promise.all([
        trainerService.getSpecializationTags(),
        trainerService.getMethodologyTags(),
        trainerService.getDisabilityTags(),
      ]);
      setSpecializationTags(specs);
      setMethodologyTags(methods);
      setDisabilityTags(disability);
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
    if (!user) { setError('Сесія закінчилась. Увійдіть знову.'); return false; }
    if (!step1.city) { setError('Оберіть місто'); return false; }
    if (step1.gender === null) { setError('Оберіть стать'); return false; }
    if (!step1.birthDate) { setError('Введіть дату народження'); return false; }
    if (step1.bio && step1.bio.length > 2000) { setError('Біографія не може перевищувати 2000 символів'); return false; }
    setIsLoading(true);
    setError(null);
    try {
      await trainerService.patchTrainerStep1(user.id, {
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: step1.avatarUrl,
        city: step1.city,
        gender: step1.gender,
        birthDate: step1.birthDate,
        bio: step1.bio,
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
    if (!user) { setError('Сесія закінчилась. Увійдіть знову.'); return false; }
    const years = parseInt(step2.experienceYears);
    if (isNaN(years) || years < 0 || years > 100) {
      setError('Введіть коректну кількість років досвіду (0–100)');
      return false;
    }
    if (step2.specializationTagIds.length === 0) {
      setError('Оберіть хоча б одну спеціалізацію');
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      await trainerService.patchTrainerStep2(user.id, {
        experienceYears: years,
        specializationTagIds: step2.specializationTagIds,
        methodologyTagIds: step2.methodologyTagIds,
        hasAccess: step2.hasAccess,
        accessTagIds: step2.hasAccess ? step2.accessTagIds : [],
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти. Спробуйте ще раз.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
  const MAX_SIZE = 10 * 1024 * 1024;

  const submitDocument = async (doc: TrainerStep3DocForm): Promise<boolean> => {
    if (!user) { setError('Сесія закінчилась. Увійдіть знову.'); return false; }
    if (!doc.file) { setError('Оберіть файл для завантаження'); return false; }
    if (!ALLOWED_TYPES.includes(doc.file.type)) { setError('Дозволені формати: JPG, PNG, PDF'); return false; }
    if (doc.file.size > MAX_SIZE) { setError('Файл перевищує 10 МБ'); return false; }
    setIsLoading(true);
    setError(null);
    try {
      const result = await trainerService.postTrainerDocument(user.id, {
        file: doc.file,
        documentType: doc.documentType,
      });
      setAddedDocs((prev) => [...prev, result]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося завантажити документ. Спробуйте ще раз.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const submitSlot = async (slot: TrainerStep4SlotForm): Promise<boolean> => {
    if (!user) { setError('Сесія закінчилась. Увійдіть знову.'); return false; }
    if (!slot.date) { setError('Оберіть дату'); return false; }
    if (!slot.startTime || !slot.endTime) { setError('Вкажіть час початку та кінця'); return false; }
    if (slot.startTime >= slot.endTime) { setError('Час завершення має бути пізніше часу початку'); return false; }
    const price = parseFloat(slot.pricePerSession);
    const maxClients = parseInt(slot.maxClients);
    if (isNaN(price) || price <= 0) { setError('Введіть коректну вартість'); return false; }
    if (isNaN(maxClients) || maxClients < 1 || maxClients > 100) { setError('Кількість клієнтів має бути від 1 до 100'); return false; }
    setIsLoading(true);
    setError(null);
    try {
      const result = await trainerService.postTrainerSlot(user.id, {
        startTime: `${slot.date}T${slot.startTime}:00`,
        endTime: `${slot.date}T${slot.endTime}:00`,
        format: slot.format,
        pricePerSession: price,
        maxClients,
      });
      setAddedSlots((prev) => [...prev, result]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти слот. Спробуйте ще раз.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step1, step2, addedDocs, addedSlots,
    setStep1, setStep2,
    specializationTags, methodologyTags, disabilityTags,
    tagsLoading, tagsError, retryTags: fetchTags,
    isLoading, error, clearError: () => setError(null),
    uploadAvatar,
    isUploadingAvatar,
    uploadAvatarError,
    submitStep1, submitStep2, submitDocument, submitSlot,
  };
}
