import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 text-sm">
      <p>
        Go to{" "}
        <Link className="hover:underline" href="/docs">
          /docs
        </Link>
        …
      </p>
    </div>
  )
}
