import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <Skeleton className="h-12 w-3/4 md:h-16" />
      <Skeleton className="mt-3 h-5 w-1/2" />
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
