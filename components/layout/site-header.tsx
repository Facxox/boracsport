"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShoppingBag, Sparkles, User } from "lucide-react"
import { useState } from "react"
import { Button, ButtonLink } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useCartStore, useCartHasHydrated } from "@/stores/cart-store"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { AdminNavLink } from "@/components/layout/admin-nav-link"
import { siteConfig } from "@/lib/config/site"

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/personalizar", label: "Personalizar" },
  { href: "/cuenta", label: "Mi cuenta" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const openCart = useCartStore((s) => s.open)
  const cartCount = useCartStore((s) =>
    s.items.reduce((acc, it) => acc + it.qty, 0),
  )
  const hasHydrated = useCartHasHydrated()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-[28px] z-40 w-full border-b border-white/5 backdrop-blur-md md:top-[32px]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:h-16">
        <Link
          href="/"
          className="font-display text-foreground text-lg font-extrabold tracking-tight md:text-xl"
        >
          <span className="text-brand-red">Borac</span>{" "}
          <span className="text-foreground">Sport</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
                  (active
                    ? "text-brand-red"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1">
          <ButtonLink
            href="/personalizar"
            variant="ghost"
            size="sm"
            className="text-brand-red hidden font-semibold md:inline-flex"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Diseñá en 3D
          </ButtonLink>
          <AdminNavLink />
          <ThemeToggle />
          <ButtonLink
            href="/cuenta"
            variant="ghost"
            size="icon"
            aria-label="Mi cuenta"
            className="hidden sm:inline-flex"
          >
            <User className="h-4 w-4" />
          </ButtonLink>
          <Button
            variant="ghost"
            size="icon"
            onClick={openCart}
            aria-label="Abrir carrito"
            className="relative"
          >
            <ShoppingBag className="h-4 w-4" />
            {hasHydrated && cartCount > 0 && (
              <span className="bg-brand-red text-foreground absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
                {cartCount}
              </span>
            )}
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={(props: React.HTMLAttributes<HTMLElement>) => (
                <Button
                  {...props}
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Menú"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
            />
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-display">
                  <span className="text-brand-red">Borac</span> Sport
                </SheetTitle>
              </SheetHeader>
              <Separator className="my-3" />
              <nav className="flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="hover:bg-muted rounded-md px-3 py-2 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
