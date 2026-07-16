import type { ExpressDesignPayload } from "@/lib/designer/design-types"

export type ProductLine = {
  kind: "product"
  key: string
  id: string
  slug: string
  name: string
  price: number
  qty: number
  image?: string
}

export type DesignLine = {
  kind: "design"
  key: string
  designId: string
  payload: ExpressDesignPayload
  customPrice: 0
  qty: 1
  editorUrl: string
  previewLabel: string
}

export type CartItem = ProductLine | DesignLine
