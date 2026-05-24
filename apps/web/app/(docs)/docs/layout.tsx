import { source } from "@/lib/source"
import { SiteHeader } from "./_components/header"
import { DocsSidebar } from "./_components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="[--header-height:4.5rem]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <DocsSidebar tree={source.pageTree} />
          {/* min-w-0 lets the inset shrink below its intrinsic content width
              (wide tables, long unbreakable code tokens) instead of pushing
              the TOC off-screen on pages that have them. */}
          <SidebarInset className="min-w-0">{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
