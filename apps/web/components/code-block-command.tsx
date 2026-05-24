"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-button"

type Manager = "pnpm" | "npm" | "yarn" | "bun"

const managers: Manager[] = ["pnpm", "npm", "yarn", "bun"]

export function CodeBlockCommand({
  npm,
  yarn,
  pnpm,
  bun,
  className,
}: {
  npm: string
  yarn: string
  pnpm: string
  bun: string
  className?: string
}) {
  const [active, setActive] = React.useState<Manager>("pnpm")
  const commands: Record<Manager, string> = { pnpm, npm, yarn, bun }

  return (
    <div
      className={cn(
        "relative my-6 rounded-[var(--radius)] bg-foreground",
        className
      )}
    >
      <div className="flex gap-0 px-5 pt-3">
        {managers.map((mgr) => (
          <button
            key={mgr}
            type="button"
            onClick={() => setActive(mgr)}
            data-active={active === mgr}
            className="border-b-2 border-transparent px-3 py-1.5 font-mono text-[13px] font-semibold text-background opacity-50 transition-opacity data-[active=true]:border-accent data-[active=true]:text-accent data-[active=true]:opacity-100"
          >
            {mgr}
          </button>
        ))}
      </div>
      <div className="relative px-5 py-4 pr-20 font-mono text-sm text-background">
        <CopyButton
          value={commands[active]}
          className="absolute top-3 right-3"
        />
        {commands[active]}
      </div>
    </div>
  )
}
