// @ts-nocheck
import { browser } from "fumadocs-mdx/runtime/browser"
import type * as Config from "../source.config"

const create = browser<
  typeof Config,
  import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
    DocData: {}
  }
>()
const browserCollections = {
  docs: create.doc("docs", {
    "index.mdx": () => import("../content/docs/index.mdx?collection=docs"),
    "installation.mdx": () =>
      import("../content/docs/installation.mdx?collection=docs"),
    "core/api.mdx": () =>
      import("../content/docs/core/api.mdx?collection=docs"),
    "core/index.mdx": () =>
      import("../content/docs/core/index.mdx?collection=docs"),
    "core/quick-start.mdx": () =>
      import("../content/docs/core/quick-start.mdx?collection=docs"),
    "react/index.mdx": () =>
      import("../content/docs/react/index.mdx?collection=docs"),
    "react/quick-start.mdx": () =>
      import("../content/docs/react/quick-start.mdx?collection=docs"),
  }),
}
export default browserCollections
