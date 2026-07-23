import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { CartDrawer } from "@/components/layout/cart-drawer"
import { DesignerBridgeMount } from "@/components/layout/designer-bridge-mount"
import { SignOutCleanup } from "@/components/checkout/sign-out-cleanup"
import { StoreWipeOnIdle } from "@/components/checkout/store-wipe-on-idle"
import { siteConfig } from "@/lib/config/site"
import { getBaseUrl } from "@/lib/env"
import "./globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" })

function safeMetadataBase(): URL {
  try {
    return new URL(getBaseUrl())
  } catch {
    return new URL("http://localhost:3000")
  }
}

export const metadata: Metadata = {
  metadataBase: safeMetadataBase(),
  title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: { type: "website", title: siteConfig.name, description: siteConfig.description, locale: "es_UY" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es" suppressHydrationWarning className={`${inter.variable} antialiased`}><body className="bg-background text-foreground flex min-h-screen flex-col font-sans"><ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="borac-theme"><SiteHeader /><main className="flex-1">{children}</main><SiteFooter /><CartDrawer /><Toaster richColors position="top-right" /><DesignerBridgeMount /><SignOutCleanup /><StoreWipeOnIdle /></ThemeProvider></body></html>
}
