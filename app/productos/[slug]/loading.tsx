import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <Skeleton className="h-4 w-32" />
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-11 w-40" />
        </div>
      </div>
    </div>
  )
}
