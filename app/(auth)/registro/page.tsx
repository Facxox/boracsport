import { redirect } from "next/navigation"
import { getActiveCategories } from "@/lib/supabase/queries/categories"
import { getCurrentUser } from "@/lib/supabase/queries/auth"
import { RegistrationForm } from "./registration-form"

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
  return <RegistrationForm cards={cards} />
}