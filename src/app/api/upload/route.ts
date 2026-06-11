import { NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "node:crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createClient } from "@supabase/supabase-js"
import { uploadBookSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import {
  STORAGE_BUCKET,
  getCoverExtension,
  getCoverValidationError,
  getPdfValidationError,
  isValidStoragePath,
} from "@/lib/upload"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type CompletedUploadRequest = {
  title?: string
  author?: string
  description?: string
  pdf?: {
    path?: string
    size?: number
  }
  cover?: {
    path?: string
    size?: number
  } | null
}

function randomId() {
  return crypto.randomBytes(16).toString("hex")
}

async function ensureActiveSession() {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 }) }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { status: true },
  })

  if (!user || user.status !== "ACTIVE") {
    return { error: NextResponse.json({ error: "Akun belum disetujui atau dinonaktifkan" }, { status: 403 }) }
  }

  return { session }
}

async function handleMultipartUpload(request: Request, uploaderId: string) {
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

  const pdfError = getPdfValidationError(pdfFile)
  if (pdfError) {
    return NextResponse.json({ error: pdfError }, { status: 400 })
  }

  const pdfPath = `pdf/${randomId()}.pdf`
  const { error: pdfUploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(pdfPath, pdfFile, { contentType: "application/pdf" })

  if (pdfUploadError) {
    return NextResponse.json({ error: "Gagal upload PDF" }, { status: 500 })
  }

  const { data: pdfUrl } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(pdfPath)

  let coverUrl: string | null = null

  if (coverFile && coverFile.size > 0) {
    const coverError = getCoverValidationError(coverFile)
    if (coverError) {
      return NextResponse.json({ error: coverError }, { status: 400 })
    }

    const coverPath = `covers/${randomId()}.${getCoverExtension(coverFile.name)}`
    const { error: coverUploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(coverPath, coverFile, { contentType: coverFile.type })

    if (coverUploadError) {
      return NextResponse.json({ error: "Gagal upload cover" }, { status: 500 })
    }

    const { data: coverData } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(coverPath)
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
      uploaderId,
      status: "APPROVED",
    },
  })

  return NextResponse.json({ message: "Buku berhasil diupload", bookId: book.id }, { status: 201 })
}

async function handleCompletedUpload(request: Request, uploaderId: string) {
  const body = (await request.json()) as CompletedUploadRequest

  const parsed = uploadBookSchema.safeParse({
    title: body.title || "",
    author: body.author || "",
    description: body.description || undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const pdfPath = body.pdf?.path
  const pdfSize = body.pdf?.size

  if (typeof pdfPath !== "string" || !isValidStoragePath(pdfPath, "pdf")) {
    return NextResponse.json({ error: "Lokasi file PDF tidak valid" }, { status: 400 })
  }

  if (typeof pdfSize !== "number" || !Number.isFinite(pdfSize) || pdfSize <= 0) {
    return NextResponse.json({ error: "Ukuran file PDF tidak valid" }, { status: 400 })
  }

  const pdfError = getPdfValidationError({ name: pdfPath, size: pdfSize, type: "application/pdf" })
  if (pdfError) {
    return NextResponse.json({ error: pdfError }, { status: 400 })
  }

  const { error: pdfInfoError } = await supabaseAdmin.storage.from(STORAGE_BUCKET).info(pdfPath)
  if (pdfInfoError) {
    return NextResponse.json({ error: "File PDF belum berhasil diupload" }, { status: 400 })
  }

  let coverUrl: string | null = null

  if (body.cover) {
    const coverPath = body.cover.path
    const coverSize = body.cover.size

    if (typeof coverPath !== "string" || !isValidStoragePath(coverPath, "covers")) {
      return NextResponse.json({ error: "Lokasi file cover tidak valid" }, { status: 400 })
    }

    if (typeof coverSize !== "number" || !Number.isFinite(coverSize) || coverSize <= 0) {
      return NextResponse.json({ error: "Ukuran file cover tidak valid" }, { status: 400 })
    }

    const coverType = coverPath.endsWith(".webp")
      ? "image/webp"
      : coverPath.endsWith(".png")
        ? "image/png"
        : "image/jpeg"

    const coverError = getCoverValidationError({ name: coverPath, size: coverSize, type: coverType })
    if (coverError) {
      return NextResponse.json({ error: coverError }, { status: 400 })
    }

    const { error: coverInfoError } = await supabaseAdmin.storage.from(STORAGE_BUCKET).info(coverPath)
    if (coverInfoError) {
      return NextResponse.json({ error: "File cover belum berhasil diupload" }, { status: 400 })
    }

    const { data: coverData } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(coverPath)
    coverUrl = coverData.publicUrl
  }

  const { data: pdfUrl } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(pdfPath)

  const book = await prisma.book.create({
    data: {
      title: parsed.data.title,
      author: parsed.data.author,
      description: parsed.data.description ?? null,
      coverUrl,
      fileUrl: pdfUrl.publicUrl,
      fileSize: pdfSize,
      uploaderId,
      status: "APPROVED",
    },
  })

  return NextResponse.json({ message: "Buku berhasil diupload", bookId: book.id }, { status: 201 })
}

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"
    const rl = checkRateLimit(`upload:${ip}`, 10, 60000)
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak upload. Coba lagi nanti." }, { status: 429 })
    }

    const authResult = await ensureActiveSession()
    if (authResult.error) {
      return authResult.error
    }

    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      return handleCompletedUpload(request, authResult.session.user.id)
    }

    return handleMultipartUpload(request, authResult.session.user.id)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat upload" }, { status: 500 })
  }
}
