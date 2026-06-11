import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Silakan login" }, { status: 401 })
    }

    const { bookId, currentPage, totalPages } = await request.json()

    if (!bookId || typeof currentPage !== "number" || typeof totalPages !== "number") {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 })
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true },
    })

    if (!book) {
      return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 })
    }

    await prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId,
        },
      },
      update: {
        currentPage,
        totalPages,
        lastReadAt: new Date(),
      },
      create: {
        userId: session.user.id,
        bookId,
        currentPage,
        totalPages,
      },
    })

    return NextResponse.json({ message: "Progress tersimpan" })
  } catch (error) {
    console.error("Progress error:", error)
    return NextResponse.json({ error: "Gagal menyimpan progress" }, { status: 500 })
  }
}
