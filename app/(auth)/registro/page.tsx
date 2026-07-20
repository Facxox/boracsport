import { redirect } from "next/navigation"
import { getActiveCategories } from "@/lib/supabase/queries/categories"
import { getCurrentUser } from "@/lib/supabase/queries/auth"
import { RegistrationStep1 } from "./registration-step1"
import { RegistrationStep2 } from "./registration-step2"

type SearchParams = Promise<{
  step?: string
  name?: string
  email?: string
  phone?: string
}>

export default async function RegistroPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser()
  if (user) redirect("/cuenta")
  const sp = await searchParams
  const step = sp.step === "intereses" ? "intereses" : "datos"

  if (step === "intereses") {
    const categories = await getActiveCategories()
    const cards = categories.map((c) => ({
      slug: c.slug,
      title: c.label,
      emoji: c.emoji || "✨",
      description: c.description,
    }))
    return (
      <RegistrationStep2
        cards={cards}
        step1Data={{
          fullName: typeof sp.name === "string" ? sp.name : "",
          email: typeof sp.email === "string" ? sp.email : "",
          phone: typeof sp.phone === "string" ? sp.phone : "",
          password: "", // El password no viaja en URL por seguridad; el cliente lo reusa desde memory si lo necesita. Para Supabase signUp necesitamos reenviar — el password real lo mantiene el cliente durante el flow.
        }}
      />
    )
  }

  return (
    <RegistrationStep1
      initialStep1Data={{
        fullName: typeof sp.name === "string" ? sp.name : undefined,
        email: typeof sp.email === "string" ? sp.email : undefined,
        phone: typeof sp.phone === "string" ? sp.phone : undefined,
      }}
    />
  )
}
