import Link from "next/link"
import { auth } from "@/lib/auth"
import { buttonVariants } from "@/components/ui/button"
import { Marquee } from "@/components/ui/marquee"
import { HomeNavbar } from "./_components/HomeNavbar"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Upload,
  BookMarked,
  Users,
  ArrowRight,
  Sparkles,
  Shield,
  Globe,
} from "lucide-react"

const marqueeItems = [
  "Upload PDF ebook favoritmu",
  "Baca langsung di browser",
  "Progress otomatis tersimpan",
  "Gratis selamanya",
  "Open source",
  "Komunitas literasi Indonesia",
  "PWA — install di homescreen",
  "Tanpa batasan upload",
]

export default async function HomePage() {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <HomeNavbar />

      {/* ─── Hero ─── */}
      <section
        className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-20 text-center"
        style={{ backgroundColor: "#deecff" }}
      >
        {/* Grid lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(#000 1px, transparent 1px),
              linear-gradient(90deg, #000 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />

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
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 4 Q 25 8, 50 4 T 100 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-primary"
                  />
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
              <Link
                href="/library"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group gap-2 px-8"
                )}
              >
                Jelajahi Perpustakaan
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "min-w-[200px] px-8"
                  )}
                >
                  Daftar Gratis
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
                <Link
                  href="/library"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "min-w-[200px] px-8"
                  )}
                >
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

      {/* ─── Marquee Divider ─── */}
      <div className="border-y-2 border-border bg-primary">
        <Marquee pauseOnHover={false} className="py-2.5">
          {marqueeItems.map((text, i) => (
            <span
              key={i}
              className="flex items-center gap-2.5 whitespace-nowrap text-sm font-semibold text-primary-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {text}
            </span>
          ))}
        </Marquee>
      </div>

      {/* ─── Features ─── */}
      <section className="border-t-2 border-border bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Kenapa Dunia Baca?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Dirancang untuk pengalaman membaca dan berbagi yang menyenangkan.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Upload,
                title: "Upload PDF Ebook",
                desc: "Upload ebook dalam format PDF lengkap dengan cover dan metadata. Simpan koleksimu — akses kapan saja.",
              },
              {
                icon: BookOpen,
                title: "Baca di Browser",
                desc: "PDF reader built-in yang responsif. Baca dengan nyaman di desktop, tablet, maupun smartphone.",
              },
              {
                icon: BookMarked,
                title: "Progress Otomatis",
                desc: "Halaman terakhir selalu tersimpan. Tutup browser, kembali lagi, lanjutkan persis di titik terakhir.",
              },
              {
                icon: Users,
                title: "Komunitas Literasi",
                desc: "Temukan ebook yang diupload sesama pembaca. Berbagi buku berarti berbagi pengetahuan.",
              },
              {
                icon: Globe,
                title: "Akses di Mana Saja",
                desc: "PWA-ready — install di homescreen dan gunakan layaknya aplikasi native tanpa App Store.",
              },
              {
                icon: Shield,
                title: "Gratis & Terbuka",
                desc: "Open source di bawah MIT License. Tanpa biaya, tanpa batasan. Misi kami: menyebarkan literasi.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group flex flex-col gap-4 rounded-md border-2 border-border bg-card p-6 shadow-[4px_4px_0px_0px_#000000] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#000000]"
              >
                <div className="w-fit rounded-md border-2 border-border bg-primary p-3 shadow-[2px_2px_0px_0px_#000000] transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="border-t-2 border-border px-4 py-20">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Mulai dalam 3 Langkah
            </h2>
            <p className="mt-2 text-muted-foreground">
              Tidak ribet, langsung jalan.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Daftar Akun",
                desc: "Isi nama, email, dan password. Proses registrasi kurang dari 30 detik.",
              },
              {
                step: "02",
                title: "Upload Ebook",
                desc: "Pilih file PDF, isi judul & penulis, tambahkan cover — langsung tayang.",
              },
              {
                step: "03",
                title: "Baca & Bagikan",
                desc: "Jelajahi perpustakaan, baca ebook, dan simpan progress otomatis.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex flex-col items-center gap-4 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-md border-2 border-border bg-primary text-xl font-bold text-primary-foreground shadow-[4px_4px_0px_0px_#000000]">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="border-t-2 border-border bg-primary/5 px-4 py-16">
        <div className="mx-auto grid max-w-3xl gap-8 text-center sm:grid-cols-3">
          {[
            { value: "Gratis", label: "Selamanya, Tanpa Biaya" },
            { value: "Unlimited", label: "Upload Tanpa Batas" },
            { value: "Open Source", label: "MIT License — Bebas Dipakai" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        className="relative border-t-2 border-border px-4 py-20"
        style={{ backgroundColor: "#deecff" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(#000 1px, transparent 1px),
              linear-gradient(90deg, #000 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Siap berbagi literasi?
          </h2>
          <p className="text-muted-foreground">
            Upload ebook favoritmu, temukan bacaan baru dari komunitas, dan baca
            dengan nyaman langsung di browser. Semua gratis, tanpa batasan.
          </p>
          {session ? (
            <Link
              href="/upload"
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex px-8"
              )}
            >
              Upload Ebook Sekarang
              <Upload className="ml-2 h-4 w-4" />
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "min-w-[200px] px-8"
                )}
              >
                Mulai Sekarang — Gratis
              </Link>
              <Link
                href="/library"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "min-w-[200px] px-8"
                )}
              >
                Jelajahi Koleksi
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t-2 border-border px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <img
              src="/duniabaca-icon.png"
              alt="Dunia Baca"
              className="h-5 w-5 rounded-sm"
            />
            Dunia Baca
          </div>
          <div className="flex gap-4">
            <Link href="/library" className="hover:text-foreground transition-colors">
              Perpustakaan
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              Tentang
            </Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Kontak
            </Link>
            <Link href="/register" className="hover:text-foreground transition-colors">
              Daftar
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Dunia Baca — Open source.</p>
        </div>
      </footer>
    </div>
  )
}
