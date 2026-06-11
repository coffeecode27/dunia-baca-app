import { NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "node:crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createClient } from "@supabase/supabase-js"
import { uploadBookSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_PDF_SIZE = 50 * 1024 * 1024
const MAX_COVER_SIZE = 5 * 1024 * 1024
const ALLOWED_PDF_TYPES = ["application/pdf"]
const ALLOWED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"]

function randomId() {
  return crypto.randomBytes(16).toString("hex")
}

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"
    const rl = checkRateLimit(`upload:${ip}`, 10, 60000)
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak upload. Coba lagi nanti." }, { status: 429 })
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
      return NextResponse.json({ error: "Akun belum disetujui atau dinonaktifkan" }, { status: 403 })
    }

    const formData = await request.formData()
    const pdfFile = formData.get("pdf") as File | null
    const coverFile = formData.get("cover") as File | null
    const title = (formData.get("title") as string) || ""
    const author = (formData.get("author") as string) || ""
    const description = formData.get("description") as string | undefined

    const parsed = uploadBookSchema.safeParse({ title, author, description: description || undefined })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    if (!pdfFile) {
      return NextResponse.json({ error: "File PDF wajib diupload" }, { status: 400 })
    }

    if (!ALLOWED_PDF_TYPES.includes(pdfFile.type)) {
      return NextResponse.json({ error: "File harus berformat PDF" }, { status: 400 })
    }

    if (pdfFile.size > MAX_PDF_SIZE) {
      return NextResponse.json({ error: "Ukuran PDF maksimal 50MB" }, { status: 400 })
    }

    const pdfName = `${randomId()}.pdf`
    const pdfPath = `pdf/${pdfName}`
    const { error: pdfError } = await supabaseAdmin.storage
      .from("ebooks")
      .upload(pdfPath, pdfFile, { contentType: "application/pdf" })

    if (pdfError) {
      return NextResponse.json({ error: "Gagal upload PDF" }, { status: 500 })
    }

    const { data: pdfUrl } = supabaseAdmin.storage.from("ebooks").getPublicUrl(pdfPath)

    let coverUrl: string | null = null
    if (coverFile && coverFile.size > 0) {
      if (!ALLOWED_COVER_TYPES.includes(coverFile.type)) {
        return NextResponse.json({ error: "Cover harus JPG, PNG, atau WebP" }, { status: 400 })
      }
      if (coverFile.size > MAX_COVER_SIZE) {
        return NextResponse.json({ error: "Ukuran cover maksimal 5MB" }, { status: 400 })
      }

      const coverExt = coverFile.name.split(".").pop() || "png"
      const coverName = `${randomId()}.${coverExt}`
      const coverPath = `covers/${coverName}`

      const { error: coverError } = await supabaseAdmin.storage
        .from("ebooks")
        .upload(coverPath, coverFile, {
          contentType: `image/${coverExt === "jpg" ? "jpeg" : coverExt}`,
        })

      if (coverError) {
        return NextResponse.json({ error: "Gagal upload cover" }, { status: 500 })
      }

      const { data: coverData } = supabaseAdmin.storage.from("ebooks").getPublicUrl(coverPath)
      coverUrl = coverData.publicUrl
    }

    const book = await prisma.book.create({
      data: {
        title: parsed.data.title,
        author: parsed.data.author,
        description: parsed.data.description ?? null,
        coverUrl,
        fileUrl: pdfUrl.publicUrl,
        fileSize: pdfFile.size,
        uploaderId: session.user.id,
        status: "APPROVED",
      },
    })

    return NextResponse.json({ message: "Buku berhasil diupload", bookId: book.id }, { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat upload" }, { status: 500 })
  }
}
