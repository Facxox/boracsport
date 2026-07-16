"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { ButtonLink } from "@/components/ui/button"

export function HeroCinematic() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/5">
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at top, rgba(255,90,0,0.18), transparent 60%), radial-gradient(ellipse at bottom right, rgba(0,230,118,0.10), transparent 55%), #050505" }} />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <Beams />
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="max-w-3xl">
          <span className="border-brand-red/30 bg-brand-red/10 text-brand-red inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase"><Sparkles className="h-3 w-3" />Configurador express 2D</span>
          <h1 className="font-display mt-5 text-4xl leading-[1.05] font-extrabold tracking-tight md:text-6xl lg:text-7xl">Diseñá tu equipo <span className="text-brand-red">a tu medida</span> y recibí tu pedido en Uruguay.</h1>
          <p className="text-muted-foreground mt-5 max-w-2xl text-base text-balance md:text-lg">Indumentaria deportiva, uniformes corporativos, impresión DTF y merchandising personalizado. Una experiencia premium desde el primer boceto.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><ButtonLink href="/personalizar" size="lg" className="bg-brand-red text-foreground hover:bg-[#ef4444] glow-red w-full text-base font-bold sm:w-auto"><Sparkles className="mr-2 h-4 w-4" />Diseñá tu equipo<ArrowRight className="ml-2 h-4 w-4" /></ButtonLink></motion.div>
            <ButtonLink href="/productos" variant="outline" size="lg" className="w-full text-base sm:w-auto">Ver catálogo</ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Beams() {
  return <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden opacity-40"><div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-[#dc2626] opacity-20 blur-3xl" /><div className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-[#00e676] opacity-15 blur-3xl" /></div>
}
