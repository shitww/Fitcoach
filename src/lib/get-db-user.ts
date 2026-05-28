import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Get the current user's database ID from session.
 * session.user.id is populated by the session callback from token.userId || token.sub.
 * Falls back to DB lookup via email for legacy sessions that predate the JWT callback.
 */
export async function getDbUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;

  // 兼容兜底：切库（SQLite→Postgres）/ 旧 cookie 可能残留旧的 userId，
  // 导致 update(where: {id}) 报 P2025（记录不存在）。
  // 这里先验证 id 是否仍存在；不存在则回退用 email 查一次。
  if (session.user.id) {
    const byId = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (byId?.id) return byId.id;
  }

  // Legacy fallback: look up by email for sessions without id
  const email = session.user.email;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  return user?.id || null;
}
