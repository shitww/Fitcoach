import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * Get the current user's database ID from session email.
 * This avoids the stale JWT ID problem after database resets.
 */
export async function getDbUserId(): Promise<string | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  return user?.id || null;
}
