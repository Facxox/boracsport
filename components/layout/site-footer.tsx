import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { siteConfig } from "@/lib/config/site"
import { TAX_HOLDER } from "@/lib/config/banking"
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/shared/social-icons"

export function SiteFooter() {
  return (
    <footer className="bg-bg-titanium border-t border-white/5">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4 md:py-14">
        <div>
          <h3 className="font-display text-lg font-extrabold">
            <span className="text-brand-red">Borac</span> Sport
          </h3>
          <p className="text-muted-foreground mt-2 max-w-xs text-sm">
            {siteConfig.tagline}
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-wider uppercase">
            Navegación
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/productos" className="hover:text-brand-red">Productos</Link></li>
            <li><Link href="/personalizar" className="hover:text-brand-red">Personalizar en 3D</Link></li>
            <li><Link href="/cuenta" className="hover:text-brand-red">Mi cuenta</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-wider uppercase">
            Contacto
          </h4>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>{siteConfig.contact.email}</li>
            <li>
              <Link href={siteConfig.social.whatsapp} className="hover:text-brand-red">
                WhatsApp: {siteConfig.contact.phoneDisplay}
              </Link>
            </li>
            <li className="text-xs">{TAX_HOLDER.legalName} — RUT {TAX_HOLDER.rut}</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-wider uppercase">
            Seguinos
          </h4>
          <div className="flex gap-2">
            <Link
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className="hover:bg-muted flex h-9 w-9 items-center justify-center rounded-full border border-white/10"
            >
              <InstagramIcon className="h-4 w-4" />
            </Link>
            <Link
              href={siteConfig.social.tiktok}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="TikTok"
              className="hover:bg-muted flex h-9 w-9 items-center justify-center rounded-full border border-white/10"
            >
              <TikTokIcon className="h-4 w-4" />
            </Link>
            <Link
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Facebook"
              className="hover:bg-muted flex h-9 w-9 items-center justify-center rounded-full border border-white/10"
            >
              <FacebookIcon className="h-4 w-4" />
            </Link>
            <Link
              href={siteConfig.social.whatsapp}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="WhatsApp"
              className="hover:bg-muted flex h-9 w-9 items-center justify-center rounded-full border border-white/10"
            >
              <MessageCircle className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="text-muted-foreground mx-auto max-w-7xl px-4 py-4 text-center text-xs">
          © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
