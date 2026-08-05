"use client"

// Line + área + gradient estilo "cyanChart" de la imagen de referencia,
// pero:
//   - No toca DOM directamente (sin getElementById). Funciona en SSR-friendly
//     via react-chartjs-2, registrada como Client Component.
//   - Tema coherente con Borac Sport (cyan = #06b6d4 para acentuar; el
//     primario sigue siendo #dc2626).
//   - La altura se controla por CSS para respetar maintainAspectRatio:false.
//   - Tooltip custom (no rompe el pattern del gráfico de referencia, que no
//     tenía leyenda pero sí puntos interactivos).

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

interface CyanAreaChartProps {
  /** Etiqueta visible sólo en el tooltip (los ticks X están ocultos). */
  labels: string[]
  /** Serie numérica 0..100 (o la escala que pase). */
  values: number[]
  /** Título que aparece arriba del chart. */
  title?: string
  /** Descripción corta debajo del título. */
  subtitle?: string
}

export function CyanAreaChart({ labels, values, title, subtitle }: CyanAreaChartProps) {
  // El componente <Line/> de react-chartjs-2 se encarga de pasar el canvas al
  // ChartJS. Construimos el dataset con un gradient calculado dentro del
  // plugin "beforeDraw" sólo cuando el gráfico ya tiene tamaño real, así
  // evitamos NaN en SSR/hidratación.
  const data = {
    labels,
    datasets: [
      {
        label: title ?? "Tendencia",
        data: values,
        borderColor: "#06b6d4",
        borderWidth: 3.5,
        tension: 0.42,
        fill: true,
        backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return "rgba(6, 182, 212, 0.25)"
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, "rgba(6, 182, 212, 0.45)")
          gradient.addColorStop(1, "rgba(6, 182, 212, 0)")
          return gradient
        },
        pointBackgroundColor: "#06b6d4",
        pointBorderColor: "#080c14",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointHoverBackgroundColor: "#22d3ee",
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
        borderColor: "rgba(6, 182, 212, 0.45)",
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
          <span className="bg-cyan-500/10 text-cyan-300 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ring-1 ring-inset ring-cyan-400/30">
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
