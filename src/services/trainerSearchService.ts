import { BASE_URL, authFetch, parseError } from './httpUtils';
import type { Tag, TrainerSearchRequest, TrainerSearchResult, Paginated } from '../types';

export async function searchTrainers(
  payload: TrainerSearchRequest,
  page: number,
  pageSize: number,
  sortBy: string,
  sortOrder: string,
): Promise<Paginated<TrainerSearchResult>> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy,
    sortOrder,
  });
  const res = await authFetch(`${BASE_URL}/api/trainers/search?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<Paginated<TrainerSearchResult>>;
}

export async function getTagsByCategory(category: number): Promise<Tag[]> {
  const res = await fetch(`${BASE_URL}/api/tags?category=${category}`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<Tag[]>;
}
