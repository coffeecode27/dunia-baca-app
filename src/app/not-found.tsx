import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-border bg-muted shadow-[4px_4px_0px_0px_#000000]">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="mt-8 text-4xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">
        Halaman yang kamu cari tidak ditemukan.
      </p>
      <div className="mt-6 flex gap-2">
        <Link
          href="/library"
          className={cn(buttonVariants(), "gap-2")}
        >
          Ke Perpustakaan
        </Link>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          Beranda
        </Link>
      </div>
    </div>
  )
}
