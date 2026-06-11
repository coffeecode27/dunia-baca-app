import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { writeFile, mkdir, unlink } from "node:fs/promises"
import path from "node:path"
import crypto from "node:crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadBookSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"

const MAX_PDF_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_COVER_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_PDF_TYPES = ["application/pdf"]
const ALLOWED_COVER_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

function randomId() {
  return crypto.randomBytes(16).toString("hex")
}

export async function POST(request: Request) {
  const savedFiles: string[] = []

  try {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"
    const rl = checkRateLimit(`upload:${ip}`, 10, 60000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak upload. Coba lagi nanti." },
        { status: 429 }
      )
    }

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { status: true },
    })

    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Akun belum disetujui atau dinonaktifkan" },
        { status: 403 }
      )
    }

    const formData = await request.formData()

    const pdfFile = formData.get("pdf") as File | null
    const coverFile = formData.get("cover") as File | null
    const title = formData.get("title") as string | null
    const author = formData.get("author") as string | null
    const description = formData.get("description") as string | null

    const parsed = uploadBookSchema.safeParse({ title, author, description })
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    if (!pdfFile) {
      return NextResponse.json({ error: "File PDF wajib diupload" }, { status: 400 })
    }

    if (!ALLOWED_PDF_TYPES.includes(pdfFile.type)) {
      return NextResponse.json({ error: "File harus berformat PDF" }, { status: 400 })
    }

    if (pdfFile.size > MAX_PDF_SIZE) {
      return NextResponse.json(
        { error: "Ukuran PDF maksimal 50MB" },
        { status: 400 }
      )
    }

    const baseDir = path.join(process.cwd(), "uploads")

    const pdfDir = path.join(baseDir, "pdf")
    await mkdir(pdfDir, { recursive: true })
    const pdfExt = path.extname(pdfFile.name) || ".pdf"
    const pdfName = `${randomId()}${pdfExt}`
    const pdfPath = path.join(pdfDir, pdfName)
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer())
    await writeFile(pdfPath, pdfBuffer)
    savedFiles.push(pdfPath)

    let coverUrl: string | null = null
    if (coverFile && coverFile.size > 0) {
      if (!ALLOWED_COVER_TYPES.includes(coverFile.type)) {
        await cleanupFiles(savedFiles)
        return NextResponse.json(
          { error: "Cover harus JPG, PNG, atau WebP" },
          { status: 400 }
        )
      }
      if (coverFile.size > MAX_COVER_SIZE) {
        await cleanupFiles(savedFiles)
        return NextResponse.json(
          { error: "Ukuran cover maksimal 5MB" },
          { status: 400 }
        )
      }

      const coverDir = path.join(baseDir, "covers")
      await mkdir(coverDir, { recursive: true })
      const coverExt = path.extname(coverFile.name) || ".png"
      const coverName = `${randomId()}${coverExt}`
      const coverPath = path.join(coverDir, coverName)
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer())
      await writeFile(coverPath, coverBuffer)
      savedFiles.push(coverPath)

      coverUrl = `/api/files/covers/${coverName}`
    }

    const book = await prisma.book.create({
      data: {
        title: parsed.data.title,
        author: parsed.data.author,
        description: parsed.data.description ?? null,
        coverUrl,
        fileUrl: `/api/files/pdf/${pdfName}`,
        fileSize: pdfFile.size,
        uploaderId: session.user.id,
        status: "APPROVED",
      },
    })

    return NextResponse.json({ message: "Buku berhasil diupload", bookId: book.id }, { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    await cleanupFiles(savedFiles)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat upload" },
      { status: 500 }
    )
  }
}

async function cleanupFiles(files: string[]) {
  for (const file of files) {
    try {
      await unlink(file)
    } catch {}
  }
}
