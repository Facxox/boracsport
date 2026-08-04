import { NextResponse } from "next/server"
import { safeAuthNextPath } from "@/lib/auth/safe-next-path"
import { createClient } from "@/lib/supabase/server"

// Supabase Auth callback — intercambia el code por una sesión y redirige.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = safeAuthNextPath(searchParams.get("next"))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth-callback-failed", origin))
}
