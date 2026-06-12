import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase"
import crypto from "node:crypto"

function randomId() {
  return crypto.randomBytes(16).toString("hex")
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const book = await prisma.book.findUnique({
    where: { id },
    select: { title: true, fileUrl: true, description: true, coverUrl: true },
  })

  if (!book) {
    return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 })
  }

  return NextResponse.json(book)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login" }, { status: 401 })
  }

  const { id } = await params

  const book = await prisma.book.findUnique({
    where: { id },
    select: { uploaderId: true },
  })

  if (!book || (book.uploaderId !== session.user.id && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 })
  }

  const formData = await request.formData()
  const coverFile = formData.get("cover") as File | null
  const description = formData.get("description") as string | null

  let coverUrl: string | undefined = undefined

  if (coverFile && coverFile.size > 0) {
    const ALLOWED = ["image/jpeg", "image/png", "image/webp"]
    if (!ALLOWED.includes(coverFile.type)) {
      return NextResponse.json({ error: "Cover harus JPG, PNG, atau WebP" }, { status: 400 })
    }

    const ext = coverFile.name.split(".").pop() || "png"
    const coverName = `${randomId()}.${ext}`
    const { error } = await supabase.storage
      .from("ebooks")
      .upload(`covers/${coverName}`, coverFile, {
        contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
      })

    if (!error) {
      const { data } = supabase.storage.from("ebooks").getPublicUrl(`covers/${coverName}`)
      coverUrl = data.publicUrl
    }
  }

  await prisma.book.update({
    where: { id },
    data: {
      ...(coverUrl ? { coverUrl } : {}),
      ...(description !== null ? { description } : {}),
    },
  })

  return NextResponse.json({ message: "Buku berhasil diupdate" })
}
