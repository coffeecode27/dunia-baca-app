import { NextResponse } from "next/server"
import { unlink } from "node:fs/promises"
import path from "node:path"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = await params
  const { status } = await request.json()

  if (!["ACTIVE", "BANNED"].includes(status)) {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ message: "Status diupdate" })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = await params

  if (id === session.user.id) {
    return NextResponse.json({ error: "Tidak bisa hapus diri sendiri" }, { status: 400 })
  }

  const books = await prisma.book.findMany({
    where: { uploaderId: id },
    select: { fileUrl: true, coverUrl: true },
  })

  const baseDir = path.join(process.cwd(), "uploads")
  for (const book of books) {
    const filesToDelete = [book.fileUrl, book.coverUrl].filter(Boolean) as string[]
    for (const url of filesToDelete) {
      const fileName = url.split("/").pop()
      if (!fileName) continue
      const isCover = url.includes("/covers/")
      const filePath = path.join(baseDir, isCover ? "covers" : "pdf", fileName)
      try { await unlink(filePath) } catch {}
    }
  }

  await prisma.user.delete({ where: { id } })

  return NextResponse.json({ message: "User dihapus" })
}
