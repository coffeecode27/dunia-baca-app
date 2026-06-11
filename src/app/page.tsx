import { auth } from "@/lib/auth"
import { HomeNavbar } from "./_components/HomeNavbar"
import { HomeContent } from "./_components/HomeContent"
import {
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default async function HomePage() {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <HomeNavbar />

      {/* ─── Hero ─── */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-20 text-center bg-[#deecff] dark:bg-[#1a2744]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.08] bg-[linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] dark:bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] bg-[length:80px_80px]" />

        <div className="relative z-10 mx-auto max-w-2xl space-y-8">
          <div className="space-y-5">
            <div className="mx-auto inline-flex animate-fade-in items-center gap-2 rounded-md border-2 border-border bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-[2px_2px_0px_0px_#000000]">
              <Sparkles className="h-4 w-4" />
              Platform Berbagi Ebook
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Baca, Upload,
              <br />
              <span className="relative inline-block">
                Berbagi Literasi
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                  <path d="M0 4 Q 25 8, 50 4 T 100 4" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary" />
                </svg>
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
              Platform open-source untuk berbagi ebook PDF. Upload koleksimu,
              temukan bacaan baru, dan lanjutkan bacaanmu kapan saja — di mana
              saja. Gratis, selamanya.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {session ? (
              <Link href="/library" className={cn(buttonVariants({ size: "lg" }), "group gap-2 px-8")}>
                Jelajahi Perpustakaan
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "min-w-[200px] px-8")}>
                  Daftar Gratis
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
                <Link href="/library" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "min-w-[200px] px-8")}>
                  Lihat Koleksi
                </Link>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Digunakan oleh komunitas pembaca di seluruh Indonesia
          </p>
        </div>
      </section>

      <HomeContent isLoggedIn={!!session} />
    </div>
  )
}
