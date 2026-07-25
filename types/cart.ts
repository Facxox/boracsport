export type ProductLine = {
  kind: "product"
  key: string
  id: string
  slug: string
  name: string
  price: number
  qty: number
  image?: string
  variantId?: string | null
  size?: string
  color?: string
  stockCap?: number
}

export type CartItem = ProductLine
