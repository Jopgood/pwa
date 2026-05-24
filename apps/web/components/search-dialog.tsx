"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useDocsSearch } from "fumadocs-core/search/client"
import type { SharedProps } from "fumadocs-ui/contexts/search"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

/**
 * Fumadocs marks matched substrings with literal `<mark>…</mark>` tags
 * and leaves markdown backticks intact in result content. This helper
 * renders the marks as highlighted spans and wraps backticked runs as
 * inline code chips so results read like the rest of the docs.
 */
function SearchHighlight({ content }: { content: string }) {
  // First split out <mark>…</mark> segments, preserving the matched text.
  const markRegex = /<mark>(.*?)<\/mark>/gi
  const parts: Array<{ text: string; matched: boolean }> = []
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = markRegex.exec(content)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ text: content.slice(lastIndex, m.index), matched: false })
    }
    parts.push({ text: m[1], matched: true })
    lastIndex = markRegex.lastIndex
  }
  if (lastIndex < content.length) {
    parts.push({ text: content.slice(lastIndex), matched: false })
  }

  return (
    <>
      {parts.map((p, i) =>
        p.matched ? (
          <mark
            key={i}
            className="rounded-[2px] bg-primary/20 px-[2px] text-foreground"
          >
            {stripBackticks(p.text)}
          </mark>
        ) : (
          <span key={i}>{stripBackticks(p.text)}</span>
        )
      )}
    </>
  )
}

/** Drop markdown-style backticks (they're noise without a real codeblock). */
function stripBackticks(s: string) {
  return s.replace(/`/g, "")
}

/** Drop `<mark>` tags and backticks — for places where highlighting adds
 *  noise without information (e.g. static section headings). */
function plainText(s: string) {
  return stripBackticks(s.replace(/<\/?mark>/gi, ""))
}

type SortedResult = {
  id: string
  url: string
  type: "page" | "heading" | "text"
  content: string
}

type Group = {
  page: SortedResult
  items: SortedResult[]
}

/**
 * Custom replacement for fumadocs' DefaultSearchDialog. Uses our own
 * shadcn primitives (Dialog + Command/cmdk) over fumadocs' useDocsSearch
 * hook, which runs Orama queries locally against the static index at
 * /api/search. No fumadocs-ui CSS or token aliases needed.
 */
export default function SearchDialog({ open, onOpenChange }: SharedProps) {
  const router = useRouter()
  const { search, setSearch, query } = useDocsSearch({
    type: "static",
    from: "/api/search",
  })

  // Group results: a "page" result kicks off a new group; subsequent
  // "heading" / "text" results belong to that page until the next one.
  const groups = React.useMemo<Group[]>(() => {
    if (!query.data || query.data === "empty") return []
    const out: Group[] = []
    let current: Group | null = null
    for (const result of query.data as SortedResult[]) {
      if (result.type === "page") {
        current = { page: result, items: [] }
        out.push(current)
      } else if (current) {
        current.items.push(result)
      }
    }
    return out
  }, [query.data])

  function go(url: string) {
    onOpenChange(false)
    router.push(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden border-[3px] border-border bg-background p-0 shadow-lg sm:max-w-2xl"
      >
        <DialogTitle className="sr-only">Search documentation</DialogTitle>
        <Command shouldFilter={false} className="bg-transparent">
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search docs…"
            className="h-12 text-base"
          />
          <CommandList className="max-h-[60vh]">
            {search.length > 0 && groups.length === 0 && !query.isLoading && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {search.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Type to search documentation.
              </div>
            )}
            {groups.map((group) => (
              <CommandGroup
                key={group.page.id}
                heading={
                  <span className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    {plainText(group.page.content)}
                  </span>
                }
                className="p-0! [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2"
              >
                {group.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => go(item.url)}
                    className="cursor-pointer rounded-none! px-3 py-1.5 pl-6 text-sm data-selected:bg-transparent data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                  >
                    <span
                      className={cn(
                        "truncate",
                        item.type === "heading"
                          ? "font-semibold"
                          : "text-muted-foreground"
                      )}
                    >
                      <SearchHighlight content={item.content} />
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
