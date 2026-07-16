import Link from "next/link"
import { TemplateForm } from "../template-form"

export default function NewTemplatePage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/admin/templates" className="text-sm text-white/60">← Plantillas 3D</Link>
      <h1 className="mt-4 font-sans text-4xl font-extrabold tracking-tight">Nueva plantilla 3D</h1>
      <p className="mt-1 text-sm text-white/60">
        Definí los mockups, el modelo y las zonas que el cliente podrá editar.
      </p>
      <TemplateForm />
    </main>
  )
}