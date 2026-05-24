---
name: write-docs
description: Author, audit, and restructure documentation pages for the Jopgood PWA site (apps/web). Use when creating or editing .mdx files under apps/web/content/docs, when adjusting sidebar order via meta.json, when planning the information architecture of a new docs section, or when reviewing existing pages for content quality, component overuse, and design consistency. Covers frontmatter, the custom MDX component set (Lead, Callout, Steps/Step, LinkedCard, tables, package-manager codeblocks), page-flow conventions, and a pass-by-pass audit checklist.
---

# Writing docs for apps/web

The docs site is a [fumadocs](https://fumadocs.dev/) + Next.js App Router app at [apps/web](apps/web). Content is MDX under [apps/web/content/docs](apps/web/content/docs); sidebar order is driven by `meta.json` files; rendering uses a custom MDX component set in [apps/web/components/mdx.tsx](apps/web/components/mdx.tsx) styled in a brutalist visual language.

This skill exists so docs are consistent in **structure**, **voice**, and **component usage** across pages.

## When to use

- Adding a new `.mdx` page under `apps/web/content/docs/**`
- Editing an existing doc's flow, structure, or component choices
- Creating a new folder/section and wiring its `meta.json`
- Reordering or renaming items in any sidebar group

## File layout & sidebar

```
apps/web/content/docs/
├── meta.json          # top-level order: ["index", "installation", "core", "react"]
├── index.mdx          # "Introduction" — rendered under "Getting Started"
├── installation.mdx
├── core/
│   ├── meta.json      # { "title": "@jopgood/pwa-core", "pages": ["index", "quick-start", "api"] }
│   ├── index.mdx      # section landing page — convention: title "Overview"
│   ├── quick-start.mdx
│   └── api.mdx
└── react/
    ├── meta.json
    ├── index.mdx
    └── quick-start.mdx
```

Rules:

- **Sidebar order is `meta.json`, not filename.** The `pages` array sets order; omit a file and it disappears from the sidebar (but stays routable).
- **Folders become sidebar groups**, labelled by their `meta.json` `title`. Top-level pages render in the "Getting Started" group — see [sidebar.tsx](apps/web/app/(docs)/docs/_components/sidebar.tsx).
- **Section landing pages are `index.mdx`** with title `Overview`. They explain *what this section is* and end with `<LinkedCard>`s to the meaningful next pages.
- **Keep filenames kebab-case** (`quick-start.mdx`, not `quickStart.mdx`).

When adding a new section folder, you must:
1. Create `<section>/meta.json` with `title`, optional `description`, and `pages` array.
2. Add the folder name to the top-level `apps/web/content/docs/meta.json` `pages` array (otherwise it won't appear).
3. Create at minimum an `index.mdx` for the section.

## Frontmatter

Every `.mdx` file needs:

```mdx
---
title: Quick Start
description: One sentence that completes "This page is about…". Used in <head>, page header, and sidebar context.
---
```

- `title` is rendered as the H1 by the route, so **don't add your own `# Heading`** at the top.
- `description` is shown directly under the H1 as muted text and used for `<meta name="description">`. Keep it under ~140 chars.

## Page structure convention

Every page opens with a `<Lead>` paragraph that frames the page in one sentence:

```mdx
<Lead>
The shortest path to a working PWA. No framework, no adapter.
</Lead>
```

Then the body. Use `##` for top-level sections (becomes the table-of-contents entry — see [DocsTOC](apps/web/app/(docs)/docs/_components/toc.tsx)). Use `###` inside `<Step>` blocks. Avoid `#` — the route renders the H1.

End-of-page navigation — two systems coexist:

1. **`<PageNeighbours>` prev/next bar** — rendered by the route under every MDX body. Pulls from `meta.json` order; shows just the adjacent page titles. Author can't control it from the MDX.
2. **`<LinkedCard>` exits** — author-controlled, support an eyebrow + description, can point anywhere.

Rules:

- **Leaf pages**: no `<LinkedCard>` exits. The neighbour bar is sufficient and adding cards just duplicates it.
- **Section overviews (`index.mdx`)**: use `<LinkedCard>` exits **only for destinations the neighbour bar wouldn't reach naturally**, or where the description meaningfully helps the reader choose between branches. Example: [core/index.mdx](apps/web/content/docs/core/index.mdx) ending with cards for both Quick Start *and* API Reference — the neighbour bar can only point to the next sequential page (Quick Start), so the API Reference card adds value. But a single `<LinkedCard>` to Quick Start would be redundant — drop it and let the bar do that job.
- If you have only one logical "next" and it matches the neighbour bar's target, **delete the LinkedCard**.

## MDX component cheat sheet

All of these are auto-registered in [apps/web/components/mdx.tsx](apps/web/components/mdx.tsx) — import nothing, just use them.

### `<Lead>`
The opening sentence/paragraph. Exactly one per page, immediately under the frontmatter.

### `<Callout variant="…" title="…">`
Variants: `info` (default), `note`, `tip`, `warning`, `danger`, `success`.

```mdx
<Callout variant="warning" title="Pre-release">
The API will change before 1.0. Pin exact versions.
</Callout>
```

Use sparingly — a page packed with callouts loses signal. Pick the variant by *intent*:
- `warning` — stable behavior that has caveats (e.g. unstable API, peer dep needed)
- `danger` — "don't do this" / will break in production
- `tip` — a non-obvious shortcut
- `info` / `note` — neutral side notes; default to `info`
- `success` — confirmations (rare in reference docs)

### `<Steps>` / `<Step>`
For ordered procedures (install → configure → verify). The wrapper auto-numbers; each `<Step>` should start with an `### H3` heading naming the step.

```mdx
<Steps>
  <Step>
    ### Install the package
    ```bash
    npm install @jopgood/pwa-core
    ```
  </Step>
  <Step>
    ### Register at boot
    …
  </Step>
</Steps>
```

Use for quick-start guides. Don't use for reference material — a `##` heading per item is clearer there.

### `<LinkedCard href eyebrow title>`
End-of-page or section-landing navigation card. `eyebrow` is a short category label (`Tutorial`, `Reference`, `Setup`).

```mdx
<LinkedCard href="/docs/core/api" eyebrow="Reference" title="API reference">
  Complete surface of the core package.
</LinkedCard>
```

### Tables
Used heavily for API reference. Standard Markdown — the custom renderer wraps them in a bordered container.

```mdx
| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `swPath` | `string` | — | Path to your service worker file. **Required.** |
```

Use `—` for "no default". Backtick types and option names. Bold `**Required.**` inline rather than adding a Required column.

### Code blocks

- **Inline code** (`` `foo` ``) becomes a heavy bordered chip with an accent background — visually loud. Use **only** for:
  - Exact identifiers from the package surface (`registerPWA`, `swPath`, `PWAController`)
  - File paths (`public/sw.js`) and shell commands you'd type literally
  - Type names and literal values (`"accepted"`, `boolean`)
  Do **not** wrap: ordinary nouns ("service worker", "React", "the browser"), product/package names in running prose ("React adapter", not `` `React adapter` ``), feature names, or vague concepts. If you're tempted to chip a phrase for emphasis, use **bold** instead. As a rule of thumb, more than ~3 chips in a single paragraph means you're decorating, not signposting.
- **Fenced blocks** with a language hint (`ts`, `tsx`, `js`, `bash`, `html`) get syntax highlighting (theme: `vesper`).
- **Package-manager blocks**: a single `bash` block starting with `npm install …` is automatically rendered as tabbed npm/yarn/pnpm/bun by the codeblock processor. Just write the npm form — don't duplicate.

```bash
npm install @jopgood/pwa-core
```

- **Don't add `// filename.ts` comments** to mark filenames; mention them in prose above the block instead.

### Other registered components
`<Button>`, `<Kbd>`, `<Link>` are available if needed but rarely used in docs.

## Voice & content rules

- **Lowercase headings except for proper nouns** (`Quick start`, not `Quick Start`) — match existing pages.
- **Flat, unopinionated statements** for factual material. Don't soften with "you might want to consider…"; don't hype with "blazing-fast" / "tiny" / "powerful".
- **Lead with the verb** in procedural steps ("Install the package", "Register at boot").
- **Say what it doesn't do.** Sections like "What it doesn't do" appear in multiple pages — keep this framing; it prevents scope confusion.
- **Don't invent API.** Code samples, tables, and `<Callout>`s that claim package behavior must match the actual source in [packages/](packages). If you're documenting something that doesn't exist yet, flag it — don't fabricate.

### Instructional, not salespersonal

This is the big rule. The library docs should sound like a colleague explaining what you'll have to deal with, not a product page selling features. Two markers of salesperson voice to avoid:

1. **Ownership assertions disguised as reader empowerment.** Anything like "you own X", "you bring X", "you control X". They sound like benefits-page copy. Rewrite as instructional future-tense: "you'll have to manage X yourself", "you'll need to provide X".
2. **Boast-shaped bullets in design-goal lists.** "Tiny.", "Typed.", "Composable.", "Transparent." Each is a one-word brag. Either drop the list entirely or replace each with a concrete factual sentence ("Written in TypeScript with strict types.").

Pronouns themselves are fine in genuine instructions ("you should", "you'll need to", "you can"). The problem is when pronouns dress up a feature claim.

#### Before / after

> ❌ Generate or host your service worker — you own `sw.js`.
> ✓ Generate or host your service worker — you'll have to manage the `sw.js` file yourself. [Guide on MDN ↗](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)

> ❌ Run a push server — you POST the subscription to your own backend.
> ✓ Run a push server — you'll need to handle POSTing the subscription to your own backend.

> ❌ **Headless.** No buttons, no banners. You bring the UI.
> ✓ **No UI included.** No buttons, no banners — you'll build those yourself.

### Hand off, don't strand

When the docs say "you'll need to handle X yourself," link out to where the reader can learn how. MDN for web platform APIs, framework docs for framework specifics, a deeper page in our own docs when relevant. The instructional voice creates an obligation; the link discharges it.

### Punctuation

- Em-dashes (`—`) are fine in tables and reference material. In prose, prefer spaced hyphens (` - `) to match the conversational tone of the rest of the writing.
- Avoid exclamation marks.
- Use bold sparingly — only for words a skimmer needs to register (Required, Don't, defaults).

## Authoring checklist

Before reporting a docs change complete:

1. Frontmatter has `title` and `description`; no leading `# Heading` in body.
2. Exactly one `<Lead>` immediately after frontmatter.
3. New file is listed in its folder's `meta.json` `pages` array (and the folder is in the parent `meta.json` if new).
4. Headings are `##` / `###` only (route owns the H1).
5. Section landing pages end with `<LinkedCard>` exits; leaf pages do not.
6. Code samples and tables match the real package surface — verified against `packages/*/src`.
7. Run `pnpm --filter web dev` and visually check the page renders, sidebar contains the new entry, and TOC populates from `##` headings.

## Auditing existing pages

When asked to "review", "audit", "tidy up", or "go through" the docs, work one page at a time and produce a written report **before** editing — the user should approve direction before bulk changes.

### Pass 1 — structural

For each `.mdx` file:

1. Frontmatter present with `title` + `description`? Description under ~140 chars and not a restatement of the title?
2. No leading `# H1` in the body (route owns it)?
3. Exactly one `<Lead>` immediately after frontmatter? Is it a *frame for the page* (one sentence, what you'll learn / what this is), not a summary of the package?
4. Heading levels: only `##` and `###`, no skipped levels?
5. Listed in its folder's `meta.json` `pages` array? Filename kebab-case?
6. If it's a section landing (`index.mdx`): ends with `<LinkedCard>`s pointing to the meaningful next pages?
7. If it's a leaf: no manual "next page" links (the prev/next bar handles it)?
8. **Navigation duplication check.** Look up the page's next neighbour from `meta.json`. If a `<LinkedCard>` exit on this page points to the same URL as that next neighbour, it duplicates the auto-generated `<PageNeighbours>` bar — flag for removal unless the card description adds information the bar can't (e.g. on overviews with branching paths). A page should rarely have *both* a single LinkedCard "Next →" *and* the neighbour bar pointing to the same place.

### Pass 2 — component & visual density

The brutalist theme is loud on purpose — that means each loud element has to *earn* its place. Flag any of these:

- **Inline-code overuse** (the big one you're hitting). Count `` ` `` chips per paragraph; >3 is almost always wrong. Remove chips from: framework/product names in prose, vague concepts, English nouns that just happen to map to a concept ("the browser", "the bundle"). Keep them only on literal identifiers, paths, types, and shell tokens.
- **Callout stacking.** Two `<Callout>`s in a row, or more than ~2 per page, dilutes their signal. Merge, demote to inline prose, or pick the most important one to keep.
- **Wrong callout variant.** `warning` for stable behavior, `danger` for casual tips, `tip` for things that aren't actually shortcuts — re-pick using the variant intent guide above.
- **Steps misuse.** `<Steps>` is for *ordered procedures the reader executes in sequence*. If the items are independent (e.g. "three hooks you can use"), they should be `##`/`###` sections, not steps.
- **LinkedCards on leaf pages.** Section-landing only — strip them from leaves; the `<PageNeighbours>` bar already handles "what's next".
- **Single-card "Next" duplicating the neighbour bar.** A `<LinkedCard>` whose only job is "go to the next page" is redundant with the auto-generated pagination — collapse into the bar. Multi-card branching exits are fine (the bar can only show one neighbour).
- **Tables for two rows.** A 2-row table with one column of values is usually clearer as a definition list or prose.
- **Bold/italic noise.** Bold should mark genuinely load-bearing words a skimmer needs (Required, Don't, defaults). Bolding for emphasis on every other sentence flattens the signal.

### Pass 3 — content & voice

- **Voice consistency:** instructional (not salespersonal), flat statements for unopinionated material, lowercase headings, spaced hyphens in prose. Flag any "you own X" / "you bring X" / boast-bullet lists ("Tiny.", "Fast.", "Typed.") as voice violations to rewrite per the rules above.
- **Hand-off completeness:** every "you'll have to do X yourself" should link out to where the reader can learn X (MDN for web APIs, framework docs, our own deeper page).
- **Truthfulness:** every code sample, option name, type, and behavior claim must match the actual source in [packages/](packages). Open the relevant `packages/*/src` file and verify — don't trust the existing doc.
- **Scope clarity:** does the page say *what it doesn't do*? The convention is explicit non-scope ("It does **not** do…", "What you don't get") — pages without it often confuse readers.
- **Lead-with-the-verb** in procedural prose.
- **Cross-links:** does the page link to the next logical doc(s)? Are existing links pointing to pages that still exist?

### Reporting format

When auditing, produce a per-file report like:

```
content/docs/core/api.mdx
  Structural: ✓
  Density:
    - 7 inline-code chips in "Options" intro paragraph; only swPath/scope are identifiers — drop the rest
    - Two adjacent <Callout variant="warning"> at end of page; merge or pick one
  Content:
    - "PWAController" table claims `network.online` property; source only exports `online()` method — verify with user
  Suggested edits: [list]
```

Then wait for approval before editing — or batch the obvious mechanical fixes (chip removal, heading levels, frontmatter) and surface only the judgment calls for review.

## Quick reference: where things live

| Concern | File |
| --- | --- |
| Content | [apps/web/content/docs/](apps/web/content/docs) |
| Sidebar order | each folder's `meta.json` |
| Sidebar rendering | [apps/web/app/(docs)/docs/_components/sidebar.tsx](apps/web/app/(docs)/docs/_components/sidebar.tsx) |
| MDX components & element styling | [apps/web/components/mdx.tsx](apps/web/components/mdx.tsx) |
| Page route (H1, header, neighbours, TOC) | [apps/web/app/(docs)/docs/[[...slug]]/page.tsx](apps/web/app/(docs)/docs/[[...slug]]/page.tsx) |
| Docs layout (header + sidebar shell) | [apps/web/app/(docs)/docs/layout.tsx](apps/web/app/(docs)/docs/layout.tsx) |
| fumadocs source loader | [apps/web/lib/source.ts](apps/web/lib/source.ts) |
| Code-highlighting theme | [apps/web/source.config.ts](apps/web/source.config.ts) (`vesper`) |
