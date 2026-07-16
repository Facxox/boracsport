import { formatUYU } from "@/lib/format"

export function PriceTag({
  amount,
  className,
}: {
  amount: number
  className?: string
}) {
  return (
    <span className={"font-semibold " + (className ?? "")}>
      {formatUYU(amount)}
    </span>
  )
}
