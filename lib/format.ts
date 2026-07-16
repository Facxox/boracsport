// Helpers de formato.

export function formatUYU(amount: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateUY(timestamp: number | string | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}
