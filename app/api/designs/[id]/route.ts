import "server-only"

import { NextResponse, type NextRequest } from "next/server"
import { getDesignForUser } from "@/lib/supabase/queries/designs"
import { createClient } from "@/lib/supabase/server"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  if (!UUID.test(id)) return NextResponse.json({ error: "invalid" }, { status: 400 })

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const design = await getDesignForUser(id, data.user.id)
  if (!design) return NextResponse.json({ error: "not_found" }, { status: 404 })

  return NextResponse.json({ payload: design.payload })
}
