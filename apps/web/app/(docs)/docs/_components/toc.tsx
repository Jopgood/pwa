"use client"

import * as React from "react"
import Link from "next/link"
import type { TOCItemType } from "fumadocs-core/toc"

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: "0% 0% -80% 0%" }
    )

    for (const id of itemIds) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }

    return () => {
      for (const id of itemIds) {
        const element = document.getElementById(id)
        if (element) observer.unobserve(element)
      }
    }
  }, [itemIds])

  return activeId
}

export default function DocsTOC({ toc }: { toc: TOCItemType[] }) {
  const itemIds = React.useMemo(
    () => toc.map((i) => i.url.replace("#", "")),
    [toc]
  )
  const activeHeading = useActiveItem(itemIds)

  if (!toc?.length) return null

  return (
    <aside
      aria-label="On this page"
      className="sticky top-(--header-height) hidden h-[calc(100svh-var(--header-height))] w-64 shrink-0 overflow-y-auto border-border p-6 xl:block"
    >
      <div className="mb-3 font-mono text-xs font-bold tracking-wider uppercase">
        On this page
      </div>
      <ul className="flex flex-col gap-1 border-l-2 border-border pl-3">
        {toc.map((item) => (
          <li key={item.url}>
            <Link
              href={item.url}
              data-active={item.url === `#${activeHeading}`}
              data-depth={item.depth}
              className="-mx-2 block rounded-sm px-2 py-1 font-mono text-[13px] hover:bg-primary/40 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[depth=3]:pl-4 data-[depth=4]:pl-6 data-[depth=5]:pl-8"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
