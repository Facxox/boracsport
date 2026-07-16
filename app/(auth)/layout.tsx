import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="font-display mb-6 block text-center text-2xl font-extrabold"
        >
          <span className="text-brand-red">Borac</span> Sport
        </Link>
        {children}
      </div>
    </div>
  )
}
