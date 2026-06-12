import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import type { Book } from "@/types"

interface BookCardProps {
  book: Pick<Book, "id" | "title" | "author" | "coverUrl">
  readerCount?: number
}

export function BookCard({ book, readerCount = 0 }: BookCardProps) {
  return (
    <Link href={`/book/${book.id}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md p-0 gap-0">
        <div className="relative aspect-[3/4] w-full bg-muted">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="line-clamp-2 font-medium text-sm leading-tight">
            {book.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{book.author}</p>
          {readerCount > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {readerCount} pembaca
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
