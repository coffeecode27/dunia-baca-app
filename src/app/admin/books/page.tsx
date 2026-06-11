import { revalidatePath } from "next/cache"
import { unlink } from "node:fs/promises"
import path from "node:path"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BookOpen, Trash2 } from "lucide-react"
import Link from "next/link"

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
}

const statusVariant: Record<string, "secondary" | "default" | "destructive"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
}

async function deleteBook(formData: FormData) {
  "use server"

  const bookId = formData.get("bookId") as string
  if (!bookId) return

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { fileUrl: true, coverUrl: true },
  })

  if (book) {
    const baseDir = path.join(process.cwd(), "uploads")
    const filesToDelete = [book.fileUrl, book.coverUrl].filter(Boolean) as string[]
    for (const url of filesToDelete) {
      const fileName = url.split("/").pop()
      if (!fileName) continue
      const isCover = url.includes("/covers/")
      const filePath = path.join(baseDir, isCover ? "covers" : "pdf", fileName)
      try { await unlink(filePath) } catch {}
    }
  }

  await prisma.book.delete({ where: { id: bookId } })
  revalidatePath("/admin/books")
}

export default async function AdminBooksPage() {
  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      author: true,
      status: true,
      coverUrl: true,
      fileSize: true,
      createdAt: true,
      uploader: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Buku</h1>
        <p className="mt-1 text-muted-foreground">
          {books.length} buku terdaftar
        </p>
      </div>

      <div className="space-y-2">
        {books.map((book) => (
          <Card key={book.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded border-2 border-border bg-muted">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">{book.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {book.author} &middot; oleh {book.uploader.name} &middot;{" "}
                  {(book.fileSize / 1024 / 1024).toFixed(1)} MB
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(book.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={statusVariant[book.status]}>
                  {statusLabel[book.status]}
                </Badge>
                <form action={deleteBook}>
                  <input type="hidden" name="bookId" value={book.id} />
                  <button
                    type="submit"
                    className={cn(
                      buttonVariants({ variant: "destructive", size: "icon-xs" }),
                      "shrink-0"
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
