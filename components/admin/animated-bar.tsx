"use client"

// AnimatedBar (espíritu reactbits.dev — Progressbar/AnimatedBar TS-TW).
// Anima `width` desde 0 al porcentaje objetivo cuando entra al viewport.
// Usa framer-motion 12 (mismas primitivas que reactbits.dev).

import { useInView, useMotionValue, useSpring } from "framer-motion"
import { useEffect, useRef } from "react"

interface AnimatedBarProps {
  /** Porcentaje objetivo (0-100). */
  to: number
  /** Color del relleno. */
  color?: string
  className?: string
  /** Duración de la animación en segundos. */
  duration?: number
}

export function AnimatedBar({
  to,
  color = "bg-[#dc2626]",
  className = "",
  duration = 1.2,
}: AnimatedBarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px" })
  const motion = useMotionValue(0)
  const spring = useSpring(motion, {
    damping: 20,
    stiffness: 90,
  })

  useEffect(() => {
    if (inView) motion.set(to)
  }, [inView, to, motion])

  useEffect(() => {
    const unsub = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.style.width = `${Math.max(0, Math.min(100, latest))}%`
      }
    })
    return () => unsub()
  }, [spring])

  return (
    <div
      ref={ref}
      className={`h-1.5 overflow-hidden rounded-full bg-white/10 ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(to)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: 0 }}
      />
    </div>
  )
}
