import * as React from "react"
import Link from "next/link"
import defaultMdxComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { CopyButton } from "@/components/copy-button"
import { CodeBlockCommand } from "@/components/code-block-command"

// ─── Helpers ──────────────────────────────────────────────────────

function getNodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(getNodeText).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(node))
    return getNodeText(node.props.children)
  return ""
}

function getHeadingId(children: React.ReactNode) {
  const id = getNodeText(children)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/['?]/g, "")
    .toLowerCase()
  return id || undefined
}

function HeadingAnchor({
  id,
  children,
}: {
  id?: string
  children: React.ReactNode
}) {
  if (!id) return <>{children}</>
  return (
    <a className="group no-underline" href={`#${id}`}>
      <span className="decoration-2 underline-offset-[3px] group-hover:underline">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="ml-2 font-mono text-primary opacity-0 transition-opacity group-hover:opacity-100"
      >
        #
      </span>
    </a>
  )
}

// ─── Custom MDX components ────────────────────────────────────────

function Lead({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn(
        "text-lg leading-normal text-muted-foreground [&:not(:first-child)]:mt-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

type CalloutVariant = "info" | "note" | "tip" | "warning" | "danger" | "success"

const calloutStyles: Record<CalloutVariant, string> = {
  info: "bg-info text-info-foreground [&_a]:text-accent",
  note: "bg-muted text-foreground",
  tip: "bg-accent text-foreground",
  warning: "bg-warning text-foreground",
  danger: "bg-destructive text-destructive-foreground [&_a]:text-accent",
  success: "bg-success text-success-foreground",
}

function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: CalloutVariant
  title?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "my-6 flex items-start gap-4 rounded-[var(--radius)] border-[3px] border-border p-5 shadow-lg",
        calloutStyles[variant]
      )}
    >
      {title && (
        <span className="inline-flex shrink-0 items-center rounded-sm bg-foreground px-2 py-1 font-mono text-xs font-bold tracking-wider text-background uppercase">
          {title}
        </span>
      )}
      <div className="text-sm leading-relaxed [&_p]:m-0 [&_p+p]:mt-2">
        {children}
      </div>
    </div>
  )
}

function Steps({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "my-6 ml-2 border-l-2 border-border pl-8 [counter-reset:step]",
        className
      )}
      {...props}
    />
  )
}

function Step({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative mb-8 [counter-increment:step]",
        "before:absolute before:top-0 before:-left-[49px] before:flex before:size-8 before:items-center before:justify-center",
        "before:rounded-full before:border-2 before:border-border before:bg-primary",
        "before:font-mono before:text-sm before:font-extrabold before:text-primary-foreground",
        "before:shadow-[2px_2px_0_var(--border)]",
        "before:content-[counter(step)]",
        "[&>h3]:mt-0",
        className
      )}
      {...props}
    />
  )
}

function LinkedCard({
  href,
  eyebrow,
  title,
  children,
  className,
  ...props
}: {
  href: string
  eyebrow?: string
  title: string
  children?: React.ReactNode
  className?: string
} & Omit<React.ComponentProps<typeof Link>, "href">) {
  return (
    <Link
      href={href}
      className={cn(
        "mt-6 block rounded-[var(--radius)] border-2 border-border bg-background p-4 no-underline shadow-md transition-all duration-200",
        "hover:translate-y-1 hover:shadow-sm",
        "active:translate-x-1 active:translate-y-2 active:shadow-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
      {...props}
    >
      {eyebrow && (
        <div className="mb-1 font-mono text-[11px] font-bold tracking-wider uppercase opacity-60">
          {eyebrow}
        </div>
      )}
      <div className="font-bold">{title}</div>
      {children && (
        <div className="mt-1 text-[13px] text-muted-foreground">{children}</div>
      )}
    </Link>
  )
}

// ─── Element overrides ────────────────────────────────────────────

const brutalistComponents: MDXComponents = {
  // Headings
  h1: ({ className, children, id, ...props }) => {
    const headingId = id ?? getHeadingId(children)
    return (
      <h1
        id={headingId}
        className={cn(
          "mt-2 scroll-mt-24 font-head text-4xl font-black tracking-tight",
          className
        )}
        {...props}
      >
        <HeadingAnchor id={headingId}>{children}</HeadingAnchor>
      </h1>
    )
  },
  h2: ({ className, children, id, ...props }) => {
    const headingId = id ?? getHeadingId(children)
    return (
      <h2
        id={headingId}
        className={cn(
          "mt-10 scroll-mt-24 border-b-2 border-border pb-2 font-head text-2xl font-extrabold tracking-tight first:mt-0",
          className
        )}
        {...props}
      >
        <HeadingAnchor id={headingId}>{children}</HeadingAnchor>
      </h2>
    )
  },
  h3: ({ className, children, id, ...props }) => {
    const headingId = id ?? getHeadingId(children)
    return (
      <h3
        id={headingId}
        className={cn(
          "mt-8 scroll-mt-24 font-head text-xl font-bold tracking-tight",
          className
        )}
        {...props}
      >
        <HeadingAnchor id={headingId}>{children}</HeadingAnchor>
      </h3>
    )
  },
  h4: ({ className, children, id, ...props }) => {
    const headingId = id ?? getHeadingId(children)
    return (
      <h4
        id={headingId}
        className={cn(
          "mt-6 scroll-mt-24 font-head text-base font-bold tracking-tight",
          className
        )}
        {...props}
      >
        <HeadingAnchor id={headingId}>{children}</HeadingAnchor>
      </h4>
    )
  },
  h5: ({ className, children, id, ...props }) => {
    const headingId = id ?? getHeadingId(children)
    return (
      <h5
        id={headingId}
        className={cn(
          "mt-6 scroll-mt-24 text-sm font-bold tracking-wider uppercase",
          className
        )}
        {...props}
      >
        <HeadingAnchor id={headingId}>{children}</HeadingAnchor>
      </h5>
    )
  },
  h6: ({ className, children, id, ...props }) => {
    const headingId = id ?? getHeadingId(children)
    return (
      <h6
        id={headingId}
        className={cn(
          "mt-6 scroll-mt-24 font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase",
          className
        )}
        {...props}
      >
        <HeadingAnchor id={headingId}>{children}</HeadingAnchor>
      </h6>
    )
  },

  // Paragraphs + inline text
  p: ({ className, ...props }) => (
    <p
      className={cn("leading-relaxed [&:not(:first-child)]:mt-4", className)}
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-extrabold", className)} {...props} />
  ),
  em: ({ className, ...props }) => (
    <em className={cn("italic", className)} {...props} />
  ),
  del: ({ className, ...props }) => (
    <del
      className={cn("line-through decoration-2 opacity-70", className)}
      {...props}
    />
  ),
  mark: ({ className, ...props }) => (
    <mark
      className={cn("rounded-sm bg-accent px-1 text-foreground", className)}
      {...props}
    />
  ),
  sub: ({ className, ...props }) => (
    <sub className={cn("text-[0.75em]", className)} {...props} />
  ),
  sup: ({ className, ...props }) => (
    <sup className={cn("text-[0.75em]", className)} {...props} />
  ),
  abbr: ({ className, ...props }) => (
    <abbr
      className={cn(
        "cursor-help underline decoration-dotted underline-offset-[3px]",
        className
      )}
      {...props}
    />
  ),
  small: ({ className, ...props }) => (
    <small
      className={cn("text-[13px] text-muted-foreground", className)}
      {...props}
    />
  ),

  // Links
  a: ({ className, ...props }) => (
    <a
      className={cn(
        "font-semibold text-secondary underline decoration-2 underline-offset-[3px] hover:bg-accent hover:text-foreground",
        className
      )}
      {...props}
    />
  ),

  // Lists — styling scoped to the parent so ul-li and ol-li can differ
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        "my-4 flex flex-col gap-2",
        "[&>li]:relative [&>li]:pl-6",
        "[&>li]:before:absolute [&>li]:before:top-[10px] [&>li]:before:left-0 [&>li]:before:size-3",
        "[&>li]:before:rounded-sm [&>li]:before:border-2 [&>li]:before:border-border [&>li]:before:bg-primary",
        "[&_ul>li]:before:bg-accent",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        "my-4 flex flex-col gap-2 [counter-reset:list-counter]",
        "[&>li]:relative [&>li]:pl-9 [&>li]:[counter-increment:list-counter]",
        "[&>li]:before:absolute [&>li]:before:top-0 [&>li]:before:left-0",
        "[&>li]:before:font-mono [&>li]:before:font-bold [&>li]:before:text-primary",
        "[&>li]:before:content-[counter(list-counter)'.']",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => <li className={className} {...props} />,

  // Definition lists
  dl: ({ className, ...props }) => (
    <dl
      className={cn(
        "my-4 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2",
        className
      )}
      {...props}
    />
  ),
  dt: ({ className, ...props }) => (
    <dt
      className={cn("font-mono font-bold text-primary-hover", className)}
      {...props}
    />
  ),
  dd: ({ className, ...props }) => (
    <dd className={cn("m-0", className)} {...props} />
  ),

  // Blockquote
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "my-6 rounded-r-[var(--radius)] border-l-4 border-primary bg-muted px-4 py-2 italic",
        "[&>cite]:mt-2 [&>cite]:block [&>cite]:font-mono [&>cite]:text-xs [&>cite]:text-muted-foreground [&>cite]:not-italic [&>cite]:before:content-['—_']",
        className
      )}
      {...props}
    />
  ),

  // Horizontal rule
  hr: ({ className, ...props }) => (
    <hr className={cn("my-8 border-t-2 border-border", className)} {...props} />
  ),

  // Tables
  table: ({ className, ...props }) => (
    <div className="my-6 overflow-x-auto rounded-[var(--radius)] border-[3px] border-border shadow-lg">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead className={className} {...props} />
  ),
  tbody: ({ className, ...props }) => (
    <tbody className={cn("[&>tr:hover]:bg-muted", className)} {...props} />
  ),
  tr: ({ className, ...props }) => <tr className={className} {...props} />,
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "bg-foreground px-4 py-3 text-left font-mono text-xs font-bold tracking-wider text-background uppercase",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "border-t-2 border-border px-4 py-3 align-top leading-relaxed",
        className
      )}
      {...props}
    />
  ),

  // Images + figures
  img: ({ className, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={cn(
        "max-w-full rounded-[var(--radius)] border-[3px] border-border shadow-lg",
        className
      )}
      {...props}
    />
  ),
  figure: ({ className, ...props }) => (
    <figure className={cn("my-6", className)} {...props} />
  ),
  figcaption: ({ className, ...props }) => (
    <figcaption
      className={cn(
        "mt-2 text-center font-mono text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  ),

  // Code — inline chip, package-manager tabs, or default codeblock with Copy
  code: ({
    className,
    __raw__,
    __src__,
    __npm__,
    __yarn__,
    __pnpm__,
    __bun__,
    ...props
  }: React.ComponentProps<"code"> & {
    __raw__?: string
    __src__?: string
    __npm__?: string
    __yarn__?: string
    __pnpm__?: string
    __bun__?: string
  }) => {
    // Inline code chip
    if (typeof props.children === "string") {
      return (
        <code
          className={cn(
            "rounded-sm border-2 border-border bg-accent px-1.5 py-0.5 font-mono text-[0.85em] font-semibold text-foreground box-decoration-clone",
            className
          )}
          {...props}
        />
      )
    }

    // Package manager command (rehype-pretty-code injects __npm__/__yarn__/__pnpm__/__bun__)
    if (__npm__ && __yarn__ && __pnpm__ && __bun__) {
      return (
        <CodeBlockCommand
          npm={__npm__}
          yarn={__yarn__}
          pnpm={__pnpm__}
          bun={__bun__}
        />
      )
    }

    // Default codeblock — Copy button if raw text is available
    return (
      <>
        {__raw__ && (
          <CopyButton
            value={__raw__}
            src={__src__}
            className="absolute top-3 right-3"
          />
        )}
        <code className={className} {...props} />
      </>
    )
  },

  // Pre wrapper — flat dark, no shadow
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "relative my-6 overflow-x-auto rounded-[var(--radius)] bg-foreground px-5 py-4 font-mono text-sm leading-relaxed text-background",
        className
      )}
      {...props}
    />
  ),

  // Keyboard input
  kbd: ({ className, ...props }) => <Kbd className={className} {...props} />,

  // Bring brutalist components into MDX scope
  Button,
  Kbd,
  Callout,
  Lead,
  Steps,
  Step,
  LinkedCard,
  Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn(
        "font-semibold text-secondary underline decoration-2 underline-offset-[3px] hover:bg-accent hover:text-foreground",
        className
      )}
      {...props}
    />
  ),
}

// ─── Exports ──────────────────────────────────────────────────────

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...brutalistComponents,
    ...components,
  }
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
