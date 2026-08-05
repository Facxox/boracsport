"use client"

// Line + área + gradiente — replica funcional del snippet de referencia
// que dieron, adaptado al design system de Borac Sport (paleta roja de marca
// en lugar del cyan original).
//
//   - No toca DOM directamente (sin getElementById). Funciona en SSR-friendly
//     via react-chartjs-2, registrado como Client Component.
//   - Tema coherente con Borac Sport: rojo (#dc2626) en línea, puntos y
//     gradiente. Acento de hover en rojo claro (#fca5a5).
//   - La altura se controla por CSS para respetar maintainAspectRatio:false.
//   - Tooltip custom (sigue el patrón del snippet, sin leyenda).

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
)

interface AdminTrendChartProps {
  /** Etiqueta visible sólo en el tooltip (los ticks X están ocultos). */
  labels: string[]
  /** Serie numérica 0..100 (o la escala que pase). */
  values: number[]
  /** Título que aparece arriba del chart. */
  title?: string
  /** Descripción corta debajo del título. */
  subtitle?: string
}

export function AdminTrendChart({
  labels,
  values,
  title,
  subtitle,
}: AdminTrendChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: title ?? "Tendencia",
        data: values,
        borderColor: "#dc2626",
        borderWidth: 3.5,
        tension: 0.42,
        fill: true,
        backgroundColor: (context: {
          chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } }
        }) => {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return "rgba(220, 38, 38, 0.25)"
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, "rgba(220, 38, 38, 0.45)")
          gradient.addColorStop(1, "rgba(220, 38, 38, 0)")
          return gradient
        },
        pointBackgroundColor: "#dc2626",
        pointBorderColor: "#080c14",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointHoverBackgroundColor: "#fca5a5",
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(8, 12, 20, 0.92)",
        borderColor: "rgba(220, 38, 38, 0.45)",
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "#d4d4d8",
        padding: 10,
        callbacks: {
          label: (ctx: import("chart.js").TooltipItem<"line">) =>
            ` valor: ${ctx.parsed.y ?? 0}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { display: false },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { display: false },
        min: 0,
        max: 100,
      },
    },
  } as const

  return (
    <section className="rounded-2xl border border-white/10 bg-[#101012] p-5">
      {(title || subtitle) && (
        <header className="mb-4 flex items-end justify-between gap-3">
          <div>
            {title ? (
              <h2 className="font-display text-lg font-bold">{title}</h2>
            ) : null}
            {subtitle ? (
              <p className="text-xs text-white/45 mt-1">{subtitle}</p>
            ) : null}
          </div>
          <span className="bg-[#dc2626]/10 text-[#fca5a5] rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ring-1 ring-inset ring-[#dc2626]/40">
            7d
          </span>
        </header>
      )}
      <div className="h-72 w-full">
        <Line data={data} options={options} />
      </div>
    </section>
  )
}
