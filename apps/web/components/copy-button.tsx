"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"

export function CopyButton({
  value,
  src,
  className,
}: {
  value: string
  src?: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  const onCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Copied" : "Copy"}
      data-src={src}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border-2 border-border bg-accent px-2.5 py-1 font-mono text-[11px] font-bold text-foreground transition-colors hover:bg-primary hover:text-primary-foreground",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="size-3" /> Copied
        </>
      ) : (
        <>
          <Copy className="size-3" /> Copy
        </>
      )}
    </button>
  )
}
