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
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md p-0 gap-0">
        <div className="relative aspect-[2/3] w-full bg-muted">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="line-clamp-2 font-medium text-sm leading-tight">{book.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{book.author}</p>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
            {book.uploader?.name && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" /> {book.uploader.name}
              </span>
            )}
            {book.createdAt && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {new Date(book.createdAt).toLocaleDateString("id-ID")}
              </span>
            )}
            {readerCount > 0 && <span>{readerCount} pembaca</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
