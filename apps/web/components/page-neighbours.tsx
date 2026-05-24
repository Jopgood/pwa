import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

export function PageNeighbours({
  previous,
  next,
}: {
  previous?: { name: React.ReactNode; url: string }
  next?: { name: React.ReactNode; url: string }
}) {
  if (!previous && !next) return null

  return (
    <nav
      aria-label="Page navigation"
      className="mt-16 flex flex-col gap-4 border-t-2 border-border pt-8 sm:flex-row"
    >
      {previous ? (
        <Link
          href={previous.url}
          className="flex-1 rounded-(--radius) border-2 border-border bg-background p-4 no-underline shadow-md transition-all duration-200 hover:translate-y-1 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-x-1 active:translate-y-2 active:shadow-none"
        >
          <div className="mb-1 flex items-center gap-2 font-mono text-[11px] font-bold tracking-wider uppercase opacity-60">
            <ArrowLeft className="size-3" /> Previous
          </div>
          <div className="font-bold">{previous.name}</div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {next ? (
        <Link
          href={next.url}
          className="flex-1 rounded-(--radius) border-2 border-border bg-background p-4 text-right no-underline shadow-md transition-all duration-200 hover:translate-y-1 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-x-1 active:translate-y-2 active:shadow-none"
        >
          <div className="mb-1 flex items-center justify-end gap-2 font-mono text-[11px] font-bold tracking-wider uppercase opacity-60">
            Next <ArrowRight className="size-3" />
          </div>
          <div className="font-bold">{next.name}</div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  )
}
