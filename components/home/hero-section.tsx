import { getActiveSlides } from "@/lib/supabase/queries/hero"
import { HeroCinematic } from "./hero-cinematic"
import { HeroCarousel } from "./hero-carousel"

export async function HeroSection() {
  const slides = await getActiveSlides()
  if (slides.length === 0) return <HeroCinematic />
  return <HeroCarousel slides={slides} />
}