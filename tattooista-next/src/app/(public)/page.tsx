import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PlatformLanding } from "@/components/platform-landing"

export default async function HomePage() {
  const session = await auth()

  if (session?.user?.studioSlug) {
    redirect(`/${session.user.studioSlug}`)
  }

  // Every signed-in account owns a studio (authorize() refuses any that doesn't), so
  // anyone reaching this line is signed out.
  return <PlatformLanding />
}
