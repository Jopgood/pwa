import type { Metadata } from "next"
import Link from "next/link"

// Static export can't issue an HTTP 301/302, so we ship a tiny HTML page
// with a meta-refresh (works without JS) plus a visible fallback link.
// The bare domain has no landing page — everything lives under /docs.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
  other: { refresh: "0; url=/docs" },
}

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 text-sm">
      <p>
        Redirecting to <Link href="/docs">/docs</Link>…
      </p>
    </div>
  )
}
