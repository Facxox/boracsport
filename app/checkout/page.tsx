"use client"

import { useEffect, useState } from "react"
import { Banknote, CreditCard, MessageCircle, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button, ButtonLink } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { selectSubtotal, useCartHasHydrated, useCartStore } from "@/stores/cart-store"
import { useCustomerStore } from "@/stores/customer-store"
import { formatUYU } from "@/lib/format"
import { TransferOptions } from "@/components/checkout/transfer-options"
import { MercadoPagoModal } from "@/components/checkout/mercadopago-modal"
import { WhatsAppCTA } from "@/components/checkout/whatsapp-cta"

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const hasHydrated = useCartHasHydrated()
  const storedProfile = useCustomerStore((s) => s.profile)
  const setStoredProfile = useCustomerStore((s) => s.setProfile)
  const [hydrated, setHydrated] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [mpOpen, setMpOpen] = useState(false)
  const subtotal = selectSubtotal(items)
  const empty = hasHydrated && items.length === 0

  useEffect(() => {
    setHydrated(true)
  }, [])

  // Autorrellenar desde el customer-store la primera vez que se monta.
  useEffect(() => {
    if (!hydrated) return
    if (!name && storedProfile.name) setName(storedProfile.name)
    if (!email && storedProfile.email) setEmail(storedProfile.email)
    if (!phone && storedProfile.phone) setPhone(storedProfile.phone)
    if (!address && storedProfile.address) setAddress(storedProfile.address)
  }, [hydrated, storedProfile, name, email, phone, address])

  // Persistir lo que el usuario va escribiendo para que sobreviva a recargas.
  useEffect(() => {
    if (!hydrated) return
    setStoredProfile({ name, email, phone, address })
  }, [hydrated, name, email, phone, address, setStoredProfile])

  const customer = { name, email, phone, address }

  return <div className="mx-auto max-w-5xl px-4 py-10 md:py-14"><h1 className="font-display text-3xl font-extrabold md:text-4xl">Checkout</h1>{!hasHydrated ? <p className="text-muted-foreground mt-6">Cargando…</p> : empty ? <div className="mt-10 text-center"><p className="text-muted-foreground">Tu carrito está vacío.</p><ButtonLink href="/productos" className="mt-4">Ver productos</ButtonLink></div> : <div className="mt-8 grid gap-8 md:grid-cols-[1fr_340px]"><div className="space-y-6"><section className="bg-card rounded-2xl border border-white/5 p-5"><h2 className="font-display text-lg font-extrabold">Tus datos</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="name">Nombre completo</Label><Input id="name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Pérez" /></div><div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@ejemplo.com" /></div><div className="space-y-1.5"><Label htmlFor="phone">Teléfono</Label><Input id="phone" type="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="099 123 456" /></div></div></section><section className="bg-card rounded-2xl border border-white/5 p-5"><h2 className="font-display text-lg font-extrabold">Método de pago</h2><Tabs defaultValue="transfer" className="mt-4"><TabsList className="grid w-full grid-cols-3"><TabsTrigger value="transfer"><Banknote className="mr-1.5 h-3.5 w-3.5" />Transferencia</TabsTrigger><TabsTrigger value="mp"><CreditCard className="mr-1.5 h-3.5 w-3.5" />Mercado Pago</TabsTrigger><TabsTrigger value="wa"><MessageCircle className="mr-1.5 h-3.5 w-3.5" />WhatsApp</TabsTrigger></TabsList><TabsContent value="transfer" className="mt-4"><TransferOptions items={items} customer={customer} /></TabsContent><TabsContent value="mp" className="mt-4"><div className="bg-card/60 rounded-lg border border-white/5 p-5 text-center"><CreditCard className="text-muted-foreground mx-auto h-8 w-8" /><p className="mt-3 text-sm font-semibold">Pago con tarjeta vía Mercado Pago (UYU)</p><p className="text-muted-foreground mt-1 text-sm">Abrimos la pasarela para que completes el pago.</p><Button onClick={() => setMpOpen(true)} className="bg-brand-red text-foreground hover:bg-[#ff6a1f] mt-4">Pagar con Mercado Pago<ArrowRight className="ml-2 h-4 w-4" /></Button></div></TabsContent><TabsContent value="wa" className="mt-4"><div className="bg-card/60 rounded-lg border border-white/5 p-5 text-center"><MessageCircle className="text-brand-red mx-auto h-8 w-8" /><p className="mt-3 text-sm font-semibold">Coordinamos tu pedido por WhatsApp</p><p className="text-muted-foreground mt-1 text-sm">Te enviamos un mensaje pre-armado con el detalle del carrito y los diseños incluidos.</p><WhatsAppCTA cart={{ items }} customerName={name} customerEmail={email} customerPhone={phone} className="bg-brand-red text-foreground hover:bg-[#ff6a1f] mt-4" /></div></TabsContent></Tabs></section></div><aside className="bg-card sticky top-32 h-fit rounded-2xl border border-white/5 p-5"><h2 className="font-display text-lg font-extrabold">Resumen</h2><ul className="mt-4 space-y-2 text-sm">{items.map((it) => <li key={it.key} className="flex items-center justify-between gap-2"><span className="text-muted-foreground truncate">{it.kind === "product" ? `${it.qty}× ${it.name}` : `1× ${it.previewLabel}`}</span><span className="shrink-0 font-medium">{it.kind === "product" ? formatUYU(it.price * it.qty) : "Precio a coordinar"}</span></li>)}</ul><Separator className="my-4" /><dl className="space-y-2 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-semibold">{formatUYU(subtotal)}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Envío</dt><dd className="text-muted-foreground">A coordinar</dd></div></dl></aside></div>}{/* Mercado Pago recibe el carrito mediante el diálogo cuando se conecten las credenciales. */}<MercadoPagoModal open={mpOpen} onOpenChange={setMpOpen} customer={customer} /></div>
}
