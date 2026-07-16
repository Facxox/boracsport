// Persiste el snapshot de un diseño 3D terminado en boracsport.designs.
// Solo accesible para usuarios autenticados.

import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/queries/auth"
import { saveDesignForUser } from "@/lib/supabase/queries/designs"
import { DESIGN_AUTOSAVE_VERSION } from "@/lib/constants"

export async function POST(request: Request) {
  let body: { designId?: string; payload?: { version?: number } }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 })
  }

  if (
    !body.designId ||
    typeof body.designId !== "string" ||
    body.payload?.version !== DESIGN_AUTOSAVE_VERSION
  ) {
    return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 })
  }

  const user = await getCurrentUser()
  if (!user) {
    // Si el usuario no está logueado, el diseño ya quedó en el carrito local.
    return NextResponse.json({ ok: true, persisted: false }, { status: 200 })
  }

  const result = await saveDesignForUser(
    user.id,
    body.designId,
    body.payload,
  )
  if (!result.ok) {
    return NextResponse.json(
      { error: "PERSIST_FAILED", details: result.error },
      { status: 500 },
    )
  }
  return NextResponse.json({ ok: true, persisted: true })
}
