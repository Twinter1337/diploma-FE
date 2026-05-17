import { BASE_URL, parseError } from './httpUtils';
import type { PlatformStats } from '../types';

export async function getPlatformStats(): Promise<PlatformStats> {
  const res = await fetch(`${BASE_URL}/api/stats`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<PlatformStats>;
}
