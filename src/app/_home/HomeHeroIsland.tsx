import { auth } from "@/lib/auth"
import { getDashboardBootstrapCached } from "@/lib/dashboard-bootstrap"
import HomeHero from "./HomeHero"

export default async function HomeHeroIsland() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return null

  const bootstrap = await getDashboardBootstrapCached(userId)
  return <HomeHero bootstrap={bootstrap} userId={userId} />
}
