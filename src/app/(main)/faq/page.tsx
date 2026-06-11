import { HelpCircle } from "lucide-react"

const faqs = [
  {
    q: "Apakah Dunia Baca benar-benar gratis?",
    a: "Ya, 100% gratis selamanya. Tidak ada biaya tersembunyi, tidak ada fitur premium, tidak ada subscription. Semua fitur bisa diakses oleh semua user tanpa batasan.",
  },
  {
    q: "Format ebook apa yang didukung?",
    a: "Saat ini hanya PDF. Format ePub, MOBI, dan lainnya sedang dalam pertimbangan untuk rilis mendatang.",
  },
  {
    q: "Berapa ukuran maksimal file PDF yang bisa diupload?",
    a: "Maksimal 50MB per file PDF. Untuk cover, maksimal 5MB dengan format JPG, PNG, atau WebP.",
  },
  {
    q: "Apakah ebook yang saya upload bisa dihapus?",
    a: "Saat ini hanya admin yang bisa menghapus ebook. Fitur hapus mandiri untuk user akan ditambahkan di update mendatang.",
  },
  {
    q: "Apakah progress bacaan saya tersimpan?",
    a: "Ya. Setiap kali kamu membaca ebook, halaman terakhir otomatis tersimpan. Saat kamu buka lagi ebook yang sama, kamu bisa langsung lanjut dari halaman terakhir.",
  },
  {
    q: "Bagaimana cara melaporkan konten yang melanggar?",
    a: "Kamu bisa menghubungi kami lewat email di imamsuranda@gmail.com atau DM Instagram @teukuimamsuranda. Tim akan meninjau laporan dalam 1x24 jam.",
  },
  {
    q: "Apakah saya bisa berkontribusi ke project ini?",
    a: "Tentu! Dunia Baca adalah project open-source di bawah MIT License. Kamu bisa kontribusi lewat GitHub — baik coding, desain, dokumentasi, atau sekadar melaporkan bug.",
  },
  {
    q: "Apakah Dunia Baca bisa diakses di mobile?",
    a: "Ya. Dunia Baca adalah PWA (Progressive Web App) yang bisa di-install di homescreen smartphone. Tampilannya responsif dan nyaman digunakan di layar kecil.",
  },
  {
    q: "Ke mana ebook saya disimpan?",
    a: "Saat ini file PDF disimpan di server. Ke depannya, kami berencana migrasi ke cloud storage untuk skalabilitas dan keandalan yang lebih baik.",
  },
  {
    q: "Siapa yang membuat Dunia Baca?",
    a: "Dunia Baca dibuat oleh Imam Suranda, seorang developer yang passionate di bidang open-source dan literasi digital. Kamu bisa melihat profil lengkapnya di halaman Kontak.",
  },
]

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <div className="space-y-4 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-md border-2 border-border bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-[2px_2px_0px_0px_#000000]">
          <HelpCircle className="h-4 w-4" />
          FAQ
        </div>
        <h1 className="text-3xl font-bold">Pertanyaan Umum</h1>
        <p className="mx-auto max-w-lg text-muted-foreground">
          Cari jawaban dari pertanyaan yang sering ditanyakan seputar Dunia Baca.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-md border-2 border-border bg-card p-5 shadow-[3px_3px_0px_0px_#000000]"
          >
            <h3 className="font-bold text-sm">{faq.q}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
