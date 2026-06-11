import { prisma } from "@/lib/prisma"
import { BookCard } from "@/components/books/BookCard"

interface BookGridProps {
  search?: string
}

export async function BookGrid({ search }: BookGridProps) {
  const books = await prisma.book.findMany({
    where: {
      status: "APPROVED",
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { author: { contains: search } },
            ],
          }
        : {}),
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
    take: 12,
  })

  if (books.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          readerCount={book._count.readingProgress}
        />
      ))}
    </div>
  )
}
