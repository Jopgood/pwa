import { source } from "@/lib/source"
import { createFromSource } from "fumadocs-core/search/server"

// Static export: the route is pre-rendered at build time and the resulting
// JSON ships as a regular asset. The client fetches /api/search and runs
// search locally against the Orama index.
export const dynamic = "force-static"
export const revalidate = false

export const { staticGET: GET } = createFromSource(source)
