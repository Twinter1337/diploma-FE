import { useState, useEffect, useCallback } from 'react';
import type { Tag, TrainerSearchResult, Paginated } from '../types';
import * as trainerSearchService from '../services/trainerSearchService';

export interface SearchFilters {
  name: string;
  specializationTagIds: number[];
  city: string;
  minRating: number;
  price: [number, number];
  isVerified: boolean;
  isAccess: boolean;
  disabilityTagIds: number[];
  methodologyTagIds: number[];
}

export type SortOption = 'rating' | 'price-asc' | 'price-desc';

const BLANK_FILTERS: SearchFilters = {
  name: '',
  specializationTagIds: [],
  city: '',
  minRating: 0,
  price: [0, 5000],
  isVerified: false,
  isAccess: false,
  disabilityTagIds: [],
  methodologyTagIds: [],
};

const SORT_PARAMS: Record<SortOption, { sortBy: string; sortOrder: string }> = {
  'rating': { sortBy: 'rating', sortOrder: 'desc' },
  'price-asc': { sortBy: 'price', sortOrder: 'asc' },
  'price-desc': { sortBy: 'price', sortOrder: 'desc' },
};

function buildPayload(f: SearchFilters) {
  return {
    name: f.name || null,
    city: f.city || null,
    minRating: f.minRating > 0 ? f.minRating : null,
    minPrice: f.price[0] > 0 ? f.price[0] : null,
    maxPrice: f.price[1] < 5000 ? f.price[1] : null,
    isVerified: f.isVerified || null,
    isAccess: f.isAccess || null,
    specializationTagIds: f.specializationTagIds.length > 0 ? f.specializationTagIds : null,
    disabilityTagIds: (f.isAccess && f.disabilityTagIds.length > 0) ? f.disabilityTagIds : null,
    methodologyTagIds: f.methodologyTagIds.length > 0 ? f.methodologyTagIds : null,
  };
}

export function useTrainerSearch(initialCity = '') {
  const initial: SearchFilters = initialCity
    ? { ...BLANK_FILTERS, city: initialCity }
    : BLANK_FILTERS;

  const [filters, setFilters] = useState<SearchFilters>(initial);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(initial);
  const [sort, setSort] = useState<SortOption>('rating');
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<Paginated<TrainerSearchResult> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [specializationTags, setSpecializationTags] = useState<Tag[]>([]);
  const [disabilityTags, setDisabilityTags] = useState<Tag[]>([]);
  const [methodologyTags, setMethodologyTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setTagsLoading(true);
    setTagsError(null);
    try {
      const [spec, dis, meth] = await Promise.all([
        trainerSearchService.getTagsByCategory(0),
        trainerSearchService.getTagsByCategory(1),
        trainerSearchService.getTagsByCategory(2),
      ]);
      setSpecializationTags(spec);
      setDisabilityTags(dis);
      setMethodologyTags(meth);
    } catch (err) {
      setTagsError(err instanceof Error ? err.message : 'Не вдалося завантажити фільтри. Спробуйте ще раз.');
    } finally {
      setTagsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchTags(); }, [fetchTags]);

  const fetchTrainers = useCallback(async (f: SearchFilters, s: SortOption, p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { sortBy, sortOrder } = SORT_PARAMS[s];
      const data = await trainerSearchService.searchTrainers(
        buildPayload(f),
        p,
        9,
        sortBy,
        sortOrder,
      );
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося знайти тренерів. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTrainers(appliedFilters, sort, page);
  }, [appliedFilters, sort, page, fetchTrainers]);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
    setPage(1);
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters(BLANK_FILTERS);
    setAppliedFilters(BLANK_FILTERS);
    setPage(1);
  }, []);

  const activeFilterCount =
    (appliedFilters.name ? 1 : 0) +
    appliedFilters.specializationTagIds.length +
    (appliedFilters.city ? 1 : 0) +
    (appliedFilters.minRating > 0 ? 1 : 0) +
    ((appliedFilters.price[0] !== 0 || appliedFilters.price[1] !== 5000) ? 1 : 0) +
    (appliedFilters.isVerified ? 1 : 0) +
    (appliedFilters.isAccess ? 1 : 0) +
    appliedFilters.methodologyTagIds.length;

  return {
    filters, setFilters,
    appliedFilters, setAppliedFilters,
    sort, setSort,
    page, setPage,
    result, isLoading, error,
    specializationTags, disabilityTags, methodologyTags,
    tagsLoading, tagsError, fetchTags,
    applyFilters, resetFilters,
    activeFilterCount,
  };
}
