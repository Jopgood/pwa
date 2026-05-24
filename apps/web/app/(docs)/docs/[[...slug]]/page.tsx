import { notFound } from "next/navigation"

import { source } from "@/lib/source"
import { findNeighbour } from "fumadocs-core/page-tree"
import { PageNeighbours } from "@/components/page-neighbours"
import { getMDXComponents } from "@/components/mdx"
import { createRelativeLink } from "fumadocs-ui/mdx"
import { Metadata } from "next"
import DocsTOC from "../_components/toc"

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body
  const neighbours = findNeighbour(source.pageTree, page.url)

  return (
    <div className="flex min-w-0">
      <article className="min-w-0 flex-1 px-6 py-12 lg:px-12">
        <header className="mb-8">
          <h1 className="font-head text-3xl font-black tracking-tight md:text-4xl">
            {page.data.title}
          </h1>
          {page.data.description && (
            <p className="mt-2 text-lg text-muted-foreground">
              {page.data.description}
            </p>
          )}
        </header>

        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />

        <PageNeighbours previous={neighbours.previous} next={neighbours.next} />
      </article>
      <DocsTOC toc={page.data.toc} />
    </div>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  return {
    title: page.data.title,
    description: page.data.description,
  }
}
