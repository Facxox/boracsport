import { redirect } from "next/navigation"
import { getActiveCategories } from "@/lib/supabase/queries/categories"
import { getCurrentUser } from "@/lib/supabase/queries/auth"
import { RegistrationWizard } from "./registration-wizard"

// Forzamos no-cache para que Vercel no sirva RSC stale con getActiveCategories()
// vacío después de un deploy o un seed de categorías.
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function RegistroPage() {
  const user = await getCurrentUser()
  if (user) redirect("/cuenta")

  const categories = await getActiveCategories()
  const cards = categories.map((c) => ({
    slug: c.slug,
    title: c.label,
    emoji: c.emoji || "✨",
    description: c.description,
  }))

  return <RegistrationWizard cards={cards} />
}
