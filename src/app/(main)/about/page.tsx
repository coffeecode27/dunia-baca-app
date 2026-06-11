import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Heart,
  Code,
  Globe,
  Users,
} from "lucide-react"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-16 py-8">
      {/* ─── Header ─── */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Tentang Dunia Baca</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Platform berbagi ebook open-source yang dibangun untuk komunitas
          literasi Indonesia.
        </p>
      </div>

      {/* ─── Story ─── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Cerita di Baliknya</h2>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Dunia Baca lahir dari masalah sederhana: banyak orang punya koleksi
            ebook digital tapi tidak tahu harus menyimpannya di mana. File PDF
            berserakan di folder Download, terkirim lewat chat, atau tersimpan
            di Google Drive tanpa pernah dibaca lagi.
          </p>
          <p>
            Di sisi lain, banyak orang mencari bacaan gratis tapi kesulitan
            menemukannya. Kenapa tidak mempertemukan keduanya?
          </p>
          <p>
            Dari situlah ide <b>Dunia Baca</b> muncul — sebuah tempat di mana siapa pun
            bisa mengupload ebook miliknya, dan siapa pun bisa membaca apa yang
            sudah diupload orang lain. Sederhana. Tanpa basa-basi.
          </p>
        </div>
      </section>

      {/* ─── Mission ─── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Misi Kami</h2>
        <div className="grid gap-4 sm:grid-cols-1">
          {[
            {
              icon: BookOpen,
              title: "Literasi",
              desc: "Mempermudah akses bacaan digital untuk semua orang, di mana pun mereka berada.",
            },
            {
              icon: Users,
              title: "Komunitas",
              desc: "Membangun ekosistem berbagi pengetahuan antar pembaca di seluruh Indonesia.",
            },
            {
              icon: Globe,
              title: "Aksesibilitas",
              desc: "Membaca ebook tanpa perlu download — cukup browser dan koneksi internet.",
            },
            {
              icon: Code,
              title: "Open Source",
              desc: "Dunia Baca adalah proyek open-source di bawah MIT License. Kode sumber tersedia untuk dipelajari, dimodifikasi, dan dikembangkan lebih lanjut.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-3 rounded-md border-2 border-border bg-card p-5 text-center shadow-[3px_3px_0px_0px_#000000]"
            >
              <div className="rounded-md border-2 border-border bg-primary p-2.5 shadow-[2px_2px_0px_0px_#000000]">
                <item.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      

      {/* ─── CTA ─── */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Dibangun dengan <Heart className="inline h-3.5 w-3.5 text-destructive" />{" "}
          untuk komunitas literasi Indonesia.
        </p>
      </div>
    </div>
  )
}
