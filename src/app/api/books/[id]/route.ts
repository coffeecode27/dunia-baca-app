import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const book = await prisma.book.findUnique({
    where: { id },
    select: {
      title: true,
      fileUrl: true,
    },
  })

  if (!book) {
    return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 })
  }

  return NextResponse.json(book)
}
