import type { HTMLInputTypeAttribute } from "react"
import { cn } from "@/lib/utils"

export type AdminFieldType =
  | HTMLInputTypeAttribute
  | "textarea"

export interface AdminFieldProps {
  name: string
  label: string
  type?: AdminFieldType
  required?: boolean
  defaultValue?: string
  placeholder?: string
  hint?: string
  className?: string
}

export function AdminField({
  name,
  label,
  type = "text",
  required = false,
  defaultValue,
  placeholder,
  hint,
  className,
}: AdminFieldProps) {
  const isTextarea = type === "textarea"

  return (
    <label className={cn("grid min-w-0 gap-2 text-sm", className)}>
      {label}
      {isTextarea ? (
        <textarea
          name={name}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="min-h-28 w-full min-w-0 rounded-xl border border-white/10 bg-black/20 p-3"
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="h-10 w-full min-w-0 rounded-xl border border-white/10 bg-black/20 px-3"
        />
      )}
      {hint ? <span className="text-xs text-white/50">{hint}</span> : null}
    </label>
  )
}
