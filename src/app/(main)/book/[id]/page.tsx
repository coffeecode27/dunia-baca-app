import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BookOpen, User } from "lucide-react"

interface BookDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params
  const session = await auth()

  const book = await prisma.book.findUnique({
    where: { id, status: "APPROVED" },
    include: {
      uploader: { select: { name: true } },
      _count: { select: { readingProgress: true } },
    },
  })

  if (!book) notFound()

  let userProgress = null
  if (session?.user) {
    userProgress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: book.id,
        },
      },
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative aspect-[3/4] w-full max-w-[200px] shrink-0 overflow-hidden rounded-md border-2 border-border bg-muted shadow-[4px_4px_0px_0px_#000000]">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{book.title}</h1>
            <p className="mt-1 text-muted-foreground">oleh {book.author}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <User className="h-4 w-4" />
                {book.uploader.name}
              </span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {book._count.readingProgress} pembaca
              </span>
              <Badge variant="secondary">
                {(book.fileSize / 1024 / 1024).toFixed(1)} MB
              </Badge>
            </div>

            {book.description && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {book.description}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {userProgress ? (
              <Link
                href={`/book/${book.id}/read?page=${userProgress.currentPage}`}
                className={cn(buttonVariants(), "flex-1")}
              >
                Lanjutkan Baca (Hal. {userProgress.currentPage})
              </Link>
            ) : (
              <Link
                href={`/book/${book.id}/read`}
                className={cn(buttonVariants(), "flex-1")}
              >
                Baca Sekarang
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
