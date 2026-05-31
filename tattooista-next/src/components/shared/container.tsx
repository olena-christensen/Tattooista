import { cn } from "@/lib/utils"

// The site's horizontal frame: centered, max width, responsive side padding.
// Replaces the repeated `max-w-[1280px] mx-auto px-4 min-[990px]:px-[70px]`.
// Pass a `max-w-*` in className to override the width (twMerge wins), e.g. a
// narrower reading column: <Container className="max-w-[860px]">.
export function Container({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1280px] px-4 min-[990px]:px-[70px]",
        className
      )}
    >
      {children}
    </div>
  )
}
