"use client"

import dynamic from "next/dynamic"
import type { TemplateRow } from "@/lib/supabase/types"
import type { ThreeDTemplateConfig } from "@/lib/designer/design-types"

const ThreeDDesigner = dynamic(() => import("@/components/express/ThreeDDesigner").then((module) => module.ThreeDDesigner), { ssr: false, loading: () => <div className="h-[600px] animate-pulse rounded-3xl bg-muted" /> })

export function ThreeDDesignerClient({ template, config }: { template: TemplateRow; config: ThreeDTemplateConfig }) {
  return <ThreeDDesigner template={template} config={config} />
}
