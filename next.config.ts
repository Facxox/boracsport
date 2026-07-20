import type { NextConfig } from "next";

// next/image necesita saber qué hosts externos puede optimizar. Las
// imágenes del proyecto viven en Supabase Storage; derivamos el host
// desde la env para no hardcodearlo.
function supabaseHost(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!url || url.includes("REPLACE")) return null
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

const supaHost = supabaseHost()

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    // Permitimos localhost en dev y Supabase en prod/staging. Sumamos
    // *.supabase.co y *.supabase.in por si la URL canónica cambia.
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      ...(supaHost
        ? [
            { protocol: "https", hostname: supaHost },
            { protocol: "https", hostname: `*.${supaHost}` },
            { protocol: "https", hostname: "supabase.co" },
            { protocol: "https", hostname: "*.supabase.co" },
            { protocol: "https", hostname: "supabase.in" },
            { protocol: "https", hostname: "*.supabase.in" },
          ]
        : []),
    ] as Array<{ protocol: "http" | "https"; hostname: string }>,
  },
};

export default nextConfig;
