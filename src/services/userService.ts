import { BASE_URL, authFetch, parseError } from './httpUtils';

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<{ avatarUrl: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await authFetch(`${BASE_URL}/api/users/${userId}/avatar`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<{ avatarUrl: string }>;
}

export async function deleteAvatar(userId: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api/users/${userId}/avatar`, {
    method: 'DELETE',
  });
  if (!res.ok) await parseError(res);
}
