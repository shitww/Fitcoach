/**
 * 简单的内存速率限制器
 * 用于防止暴力破解登录等场景
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// 每 5 分钟清理一次过期条目
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * 检查请求是否超过速率限制
 * @param key 唯一标识（如 IP 地址）
 * @param maxAttempts 最大尝试次数
 * @param windowMs 时间窗口（毫秒）
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function rateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remaining: number; resetAt: Date } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // 首次请求或窗口已过期，创建新条目
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetAt: new Date(now + windowMs),
    };
  }

  entry.count++;

  const allowed = entry.count <= maxAttempts;
  const remaining = Math.max(0, maxAttempts - entry.count);
  const resetAt = new Date(entry.resetAt);

  return { allowed, remaining, resetAt };
}

/**
 * 为登录请求计算 rate limit key
 * 优先级：X-Forwarded-For > IP > 'unknown'
 */
export function getClientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return `login:${ip}`;
}