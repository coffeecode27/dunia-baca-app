import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Code2,
  Camera,
  MessageCircle,
  Mail,
  ExternalLink,
  Heart,
  User,
} from "lucide-react"

const socials = [
  {
    name: "GitHub",
    handle: "coffeecode27",
    url: "https://github.com/coffeecode27",
    icon: Code2,
    color: "bg-[#24292e]",
    desc: "Lihat source code Dunia Baca dan project open-source lainnya. Star, fork, atau kontribusi!",
  },
  {
    name: "Instagram",
    handle: "@teukuimamsuranda",
    url: "https://www.instagram.com/teukuimamsuranda/",
    icon: Camera,
    color: "bg-[#E4405F]",
    desc: "Follow untuk update seputar development, tips coding, dan behind-the-scenes project.",
  },
  {
    name: "Facebook",
    handle: "Teuku Imam Suranda",
    url: "https://www.facebook.com/imamalbie/",
    icon: MessageCircle,
    color: "bg-[#1877F2]",
    desc: "Terhubung dan diskusi seputar teknologi, coding, dan project open-source.",
  },
  {
    name: "Email",
    handle: "imamsuranda@gmail.com",
    url: "mailto:imamsuranda@gmail.com",
    icon: Mail,
    color: "bg-primary",
    desc: "Punya pertanyaan, saran, atau ingin kolaborasi? Kirim email langsung.",
  },
]

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 py-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-md border-2 border-border bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-[2px_2px_0px_0px_#000000]">
          <User className="h-4 w-4" />
          Tentang Saya
        </div>
        <h1 className="text-3xl font-bold">Halo, Saya Teuku Imam Suranda</h1>
        <p className="mx-auto max-w-lg text-muted-foreground">
          Developer di balik Dunia Baca. Saya membangun project ini untuk
          memudahkan siapa pun berbagi dan membaca ebook secara gratis. Mari
          terhubung!
        </p>
      </div>

      {/* Social Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {socials.map((social) => (
          <div
            key={social.name}
            className="group flex flex-col gap-4 rounded-md border-2 border-border bg-card p-6 shadow-[4px_4px_0px_0px_#000000] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#000000]"
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border-2 border-border shadow-[2px_2px_0px_0px_#000000] transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none",
                  social.color
                )}
              >
                <social.icon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold">{social.name}</h3>
                <p className="truncate text-sm text-muted-foreground">
                  {social.handle}
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {social.desc}
            </p>

            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full gap-1.5"
              )}
            >
              {social.name === "Email" ? "Kirim Email" : `Buka ${social.name}`}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>

      {/* Support */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Dukung Project Ini</h2>
          <p className="mt-1 text-muted-foreground">
            Dunia Baca gratis selamanya. Tapi kalau kamu ingin mendukung, silakan!
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col rounded-md border-2 border-border bg-card p-6 text-center shadow-[4px_4px_0px_0px_#000000]">
            <Code2 className="mx-auto h-8 w-8 text-[#24292e]" />
            <h3 className="mt-3 font-bold">Star di GitHub</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Bantu project ini dikenal lebih banyak orang
            </p>
            <a
              href="https://github.com/imamsuranda"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants(),
                "mt-auto w-full bg-[#24292e] text-white shadow-[4px_4px_0px_0px_#000000] hover:bg-[#1b1f23]"
              )}
            >
              <Code2 className="h-4 w-4" />
              Star Repository
            </a>
          </div>

          <div className="flex flex-col rounded-md border-2 border-border bg-card p-6 text-center shadow-[4px_4px_0px_0px_#000000]">
            <img
              src="/saweria-icon.svg"
              alt="Saweria"
              className="mx-auto h-8 w-8"
            />
            <h3 className="mt-3 font-bold">Saweria</h3>
            <p className="my-1 text-sm text-muted-foreground">
              Dukung dengan donasi seikhlasnya
            </p>
            <a
              href="https://saweria.co/teukuimamsuranda"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants(),
                "mt-auto w-full bg-[#f79f1f] text-white shadow-[4px_4px_0px_0px_#000000] hover:bg-[#e08d0f]"
              )}
            >
              <img src="/saweria-icon.svg" alt="" className="h-4 w-4" />
              Saweria
            </a>
          </div>
        </div>
      </section>

      {/* Bottom */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Dibangun dengan <Heart className="inline h-3.5 w-3.5 text-destructive" /> oleh{" "}
          <span className="font-semibold text-foreground">Teuku Imam Suranda</span>
        </p>
      </div>
    </div>
  )
}
