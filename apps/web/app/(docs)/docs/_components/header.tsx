"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchContext } from "fumadocs-ui/contexts/search"
import { Kbd } from "@/components/ui/kbd"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

/**
 * Visually mimics an input but is actually a button that opens the
 * fumadocs SearchDialog. A real <input> would compete with the dialog's
 * own input for focus and for typed characters.
 */
function SearchTrigger() {
  const { setOpenSearch } = useSearchContext()
  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      aria-label="Search docs"
      className={cn(
        "ml-auto flex h-10 w-full max-w-md min-w-0 items-center justify-between gap-2 rounded-(--radius) border-2 border-border bg-background px-3 text-left text-sm shadow-md transition-colors",
        "hover:bg-muted",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      )}
    >
      <span className="truncate text-muted-foreground">Search docs…</span>
      <Kbd>⌘K</Kbd>
    </button>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b-3 bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-6 px-6">
        <Link className="flex items-center gap-3" href="/">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-(--radius) border-2 border-border bg-primary text-lg font-black shadow-md">
            J
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tight">
              Jopgood PWA
            </span>
            <span className="mt-1 font-mono text-[11px] opacity-70">
              core + adapters
            </span>
          </span>
        </Link>

        <span className="ml-2 inline-flex items-center gap-2 rounded-(--radius) border-2 border-border bg-primary px-2 py-1 font-mono text-xs font-bold shadow-md">
          v0.0.2
        </span>

        <SearchTrigger />

        <Button asChild variant="inverted" className="font-mono">
          <Link
            href="https://github.com/jopgood/pwa"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icons.github />
            GitHub
          </Link>
        </Button>
      </div>
    </header>
  )
}
