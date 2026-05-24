import { Empty } from "@/components/retroui/Empty"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Empty className="border-dashed border-amber-400 shadow-none">
        <Empty.Content>
          <Empty.Icon className="size-10 animate-bop md:size-12" />
          <Empty.Title>404!</Empty.Title>
          <Empty.Separator />
          <Empty.Description>
            The page you&apos;re looking for doesn&apos;t exist.
          </Empty.Description>
        </Empty.Content>
      </Empty>
    </div>
  )
}
