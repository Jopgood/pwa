"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { source } from "@/lib/source"

/** Normalize trailing slashes so `/docs/foo` and `/docs/foo/` compare equal. */
function samePath(a: string, b: string) {
  const strip = (s: string) => (s.length > 1 ? s.replace(/\/+$/, "") : s)
  return strip(a) === strip(b)
}

export function DocsSidebar({ tree }: { tree: typeof source.pageTree }) {
  const pathname = usePathname()
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-(--header-height) hidden h-[calc(100svh-var(--header-height))]! shrink-0 border-r-3 border-border md:flex"
    >
      <SidebarContent className="gap-8 p-6">
        {tree.children.some((n) => n.type === "page") && (
          <SidebarGroup>
            <SidebarGroupLabel>Getting Started</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {tree.children.map((node) =>
                  node.type === "page" ? (
                    <SidebarMenuItem className="mt-2" key={node.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={samePath(pathname, node.url)}
                        className="h-auto min-h-8 py-2 leading-snug whitespace-normal"
                      >
                        <Link href={node.url}>{node.name}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : null
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {tree.children.map((node) => {
          if (node.type === "folder") {
            return (
              <SidebarGroup key={node.$id}>
                <SidebarGroupLabel>{node.name}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {node.children.map((child) =>
                      child.type === "page" ? (
                        <SidebarMenuItem className="mt-2" key={child.url}>
                          <SidebarMenuButton
                            asChild
                            isActive={samePath(pathname, child.url)}
                            className="h-auto min-h-8 py-2 leading-snug whitespace-normal"
                          >
                            <Link href={child.url}>{child.name}</Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ) : null
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
          }
          return null
        })}
      </SidebarContent>
    </Sidebar>
  )
}
