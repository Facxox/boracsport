import Link from "next/link"
import { TemplateNewForm } from "./template-new-form"

export default function NewTemplatePage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/admin/templates" className="text-sm text-white/60">← Siluetas</Link>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[#dc2626]">Diseñador 3D</p>
        <h1 className="mt-2 font-sans text-3xl font-extrabold tracking-tight">Nueva silueta</h1>
        <p className="mt-1 max-w-2xl text-sm text-white/60">
          Subí los mockups frente/espalda y, si tenés, el modelo 3D (.glb/.gltf). Sin modelo, el
          diseñador usa el placeholder procedural.
        </p>
      </div>
      <div className="mt-8">
        <TemplateNewForm />
      </div>
    </main>
  )
}