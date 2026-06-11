import type { Book, User, ReadingProgress } from "@/generated/prisma/client"

export type { Book, User, ReadingProgress }

export type BookWithUploader = Book & {
  uploader: Pick<User, "id" | "name">
}

export type BookWithProgress = Book & {
  readingProgress: ReadingProgress[]
  _count: {
    readingProgress: number
  }
}

export type UserWithBooks = User & {
  books: Book[]
}

export type SafeUser = Omit<User, "passwordHash">
