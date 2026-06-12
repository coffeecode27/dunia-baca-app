import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buttonVariants } from "@/components/ui/button"
import { SearchBar } from "./_components/SearchBar"
import { BookCard } from "@/components/books/BookCard"
import { cn } from "@/lib/utils"
import { Upload, Library, BookMarked, SearchX } from "lucide-react"

interface LibraryPageProps {
  searchParams: Promise<{ search?: string; tab?: string; category?: string }>
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { search, tab = "umum", category } = await searchParams
  const session = await auth()

  const isPrivate = tab === "koleksi"

  if (isPrivate && !session) {
    redirect("/library?tab=umum")
  }

  const books = await prisma.book.findMany({
    where: {
      status: "APPROVED",
      ...(isPrivate && session
        ? { uploaderId: session.user.id }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { author: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(category ? { categoryId: category } : {}),
    },
    select: {
      id: true,
      title: true,
      author: true,
      coverUrl: true,
      _count: {
        select: { readingProgress: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isPrivate ? "Koleksi Saya" : "Perpustakaan"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isPrivate
              ? "Koleksi ebook yang telah kamu upload"
              : "Jelajahi koleksi ebook dari komunitas Dunia Baca"}
          </p>
        </div>
        {session && (
          <Link
            href="/upload"
            className={cn(buttonVariants(), "shrink-0 gap-2")}
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Ebook</span>
          </Link>
        )}
      </div>

      {/* Search */}
      <Suspense fallback={<div className="h-10 animate-pulse rounded bg-muted" />}>
        <SearchBar />
      </Suspense>

      {/* Results */}
      <Suspense fallback={
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[3/4] animate-pulse rounded-md bg-muted" />
              <div className="h-3 animate-pulse rounded bg-muted" />
              <div className="h-2 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      }>
        <BookResults books={books} isPrivate={isPrivate} search={search} session={!!session} />
      </Suspense>
    </div>
  )
}

function BookResults({ books, isPrivate, search, session }: { books: any[]; isPrivate: boolean; search?: string; session: boolean }) {
  if (books.length > 0) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {books.map((book: any) => (
          <BookCard key={book.id} book={book} readerCount={book._count.readingProgress} />
        ))}
      </div>
    )
  }

  if (search) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-6">
          <SearchX className="h-12 w-12 text-muted-foreground/60" />
        </div>
        <h2 className="mt-6 text-lg font-semibold">Tidak ditemukan</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Tidak ada ebook dengan kata kunci &quot;{search}&quot;. Coba kata kunci lain atau jelajahi semua koleksi.
        </p>
        <Link href="/library" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
          Lihat Semua
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-6">
        {isPrivate ? <BookMarked className="h-12 w-12 text-muted-foreground/60" /> : <Library className="h-12 w-12 text-muted-foreground/60" />}
      </div>
      <h2 className="mt-6 text-lg font-semibold">Belum ada ebook</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {isPrivate ? "Kamu belum mengupload ebook apapun. Mulai berbagi literasi sekarang!" : "Belum ada ebook yang tersedia. Jadilah yang pertama mengupload ebook untuk berbagi literasi!"}
      </p>
      {session && (
        <Link href="/upload" className={cn(buttonVariants(), "mt-4")}>Upload Ebook</Link>
      )}
    </div>
  )
}
