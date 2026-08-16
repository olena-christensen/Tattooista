import { PlatformLanding } from "@/components/platform-landing"

export default function HomePage() {
  // Signed-in owners are NOT redirected to their studio. They need to reach the
  // platform page — pricing, features, and the "Tattooista" link in the admin sidebar
  // all point here. PlatformHeader shows them "My Studio" to get back in one click.
  return <PlatformLanding />
}
