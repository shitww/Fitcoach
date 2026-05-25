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

  if (session.user.id) {
    return session.user.id;
  }

  // Legacy fallback: look up by email for sessions without id
  const email = session.user.email;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  return user?.id || null;
}
