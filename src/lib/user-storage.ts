/**
 * 用户隔离的 localStorage 工具
 * 所有用户数据按 userId 命名空间存储，防止不同用户之间数据串联
 */

const STORAGE_PREFIX = 'fitcoach';

function getUserPrefix(userId: string): string {
  return `${STORAGE_PREFIX}_u_${userId}`;
}

export function getUserStorageKey(userId: string, key: string): string {
  return `${getUserPrefix(userId)}_${key}`;
}

export function getUserStorageItem(userId: string | null | undefined, key: string): string | null {
  if (typeof window === 'undefined' || !userId) return null;
  return localStorage.getItem(getUserStorageKey(userId, key));
}

export function setUserStorageItem(userId: string | null | undefined, key: string, value: string): void {
  if (typeof window === 'undefined' || !userId) return;
  localStorage.setItem(getUserStorageKey(userId, key), value);
}

export function removeUserStorageItem(userId: string | null | undefined, key: string): void {
  if (typeof window === 'undefined' || !userId) return;
  localStorage.removeItem(getUserStorageKey(userId, key));
}

/**
 * 清除当前用户的所有 localStorage 数据
 */
export function clearUserStorage(userId: string): void {
  if (typeof window === 'undefined') return;
  const prefix = getUserPrefix(userId);
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * 清除所有旧的、不按用户隔离的 fitcoach 数据（迁移用）
 */
export function clearLegacyStorage(): void {
  if (typeof window === 'undefined') return;
  const legacyKeys = [
    'fitcoach_saved_exercises',
    'fitcoach_custom_exercises',
    'fitcoach_pending_workout',
  ];
  legacyKeys.forEach(key => localStorage.removeItem(key));

  // 清除旧格式的水记录 fitcoach_water_YYYY-MM-DD
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('fitcoach_water_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}
