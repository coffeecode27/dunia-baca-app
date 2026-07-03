import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, User, Clock } from "lucide-react"

interface BookCardProps {
  book: {
    id: string
    title: string
    author: string
    coverUrl: string | null
    createdAt?: string | Date
    uploader?: { name: string }
  }
  readerCount?: number
}

export function BookCard({ book, readerCount = 0 }: BookCardProps) {
  return (
    <Link href={`/book/${book.id}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg p-0 gap-0">
        <div className="relative aspect-[3/4] w-full bg-muted">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <CardContent className="p-2 sm:p-3 md:p-4">
          <h3 className="line-clamp-2 font-medium text-xs sm:text-sm md:text-base leading-snug">
            {book.title}
          </h3>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
            {book.author}
          </p>
          <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
            {book.uploader?.name && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1">
                <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {book.uploader.name}
              </span>
            )}
            {book.createdAt && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {new Date(book.createdAt).toLocaleDateString("id-ID")}
              </span>
            )}
            {readerCount > 0 && <span>{readerCount} pembaca</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
