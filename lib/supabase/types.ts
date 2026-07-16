import type { Category } from "@/lib/constants"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = "user" | "admin" | "superadmin"
export type OrderStatus =
  | "pendiente"
  | "confirmado"
  | "en_produccion"
  | "enviado"
  | "entregado"
  | "cancelado"
export type PaymentStatus = "pendiente" | "aprobado" | "rechazado" | "reembolsado"

export interface ProfileRow {
  id: string
  full_name: string
  phone: string | null
  address: string | null
  role: UserRole
  intereses: Json
  theme_preference: "light" | "dark" | "system"
  created_at: string
  updated_at: string
}

export interface SectionRow {
  id: string
  name: string
  slug: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface CategoryRow {
  id: string
  slug: string
  label: string
  emoji: string
  description: string
  display_order: number
  active: boolean
  kind: "ropa" | "pelota" | "otro"
  created_at: string
  updated_at: string
}

export interface HeroSlideRow {
  id: string
  kind: "image" | "video"
  url: string
  poster_url: string | null
  heading: string
  subheading: string
  cta_label: string
  cta_href: string
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface ProductRow {
  id: string
  slug: string
  name: string
  description: string
  price: number
  images: string[]
  tags: string[]
  category: Category
  category_id: string | null
  stock: number
  active: boolean
  featured: boolean
  on_sale: boolean
  section_id: string | null
  created_at: string
  updated_at: string
}

export interface ProductVariantRow {
  id: string
  product_id: string
  size: string
  color: string
  sku: string | null
  stock: number
  price_override: number | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface TemplateRow {
  id: string
  name: string
  mockup_url_front: string
  mockup_url_back: string
  model_url: string | null
  model_format: "glb" | "gltf" | null
  scene_config: Json
  editable_zones: Json
  default_config: Json
  version: number
  price: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface DesignRow {
  id: string
  user_id: string
  payload: Json
  created_at: string
  updated_at: string
}

export interface OrderRow {
  id: string
  user_id: string | null
  items: Json
  subtotal: number
  total: number
  status: OrderStatus
  payment_method: string
  payment_status: PaymentStatus
  payment_receipt_url: string | null
  shipping_details: Json
  created_at: string
  updated_at: string
}

export interface Database {
  boracsport: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow> & { id: string }; Update: Partial<ProfileRow> }
      sections: { Row: SectionRow; Insert: Partial<SectionRow>; Update: Partial<SectionRow> }
      categories: { Row: CategoryRow; Insert: Partial<CategoryRow> & { slug: string; label: string }; Update: Partial<CategoryRow> }
      hero_slides: { Row: HeroSlideRow; Insert: Partial<HeroSlideRow> & { kind: "image" | "video"; url: string }; Update: Partial<HeroSlideRow> }
      products: { Row: ProductRow; Insert: Partial<ProductRow>; Update: Partial<ProductRow> }
      product_variants: { Row: ProductVariantRow; Insert: Partial<ProductVariantRow> & { product_id: string }; Update: Partial<ProductVariantRow> }
      templates: { Row: TemplateRow; Insert: Partial<TemplateRow>; Update: Partial<TemplateRow> }
      designs: { Row: DesignRow; Insert: Partial<DesignRow> & { user_id: string }; Update: Partial<DesignRow> }
      orders: { Row: OrderRow; Insert: Partial<OrderRow>; Update: Partial<OrderRow> }
    }
    Functions: { get_my_role: { Args: Record<string, never>; Returns: UserRole | null } }
    Enums: { user_role: UserRole; order_status: OrderStatus; payment_status: PaymentStatus }
    CompositeTypes: Record<string, never>
  }
}

export type Product = Pick<ProductRow, "id" | "slug" | "name" | "price" | "images" | "tags" | "category" | "description"> &
  Partial<Pick<ProductRow, "stock" | "featured" | "active" | "on_sale" | "section_id" | "category_id">>
