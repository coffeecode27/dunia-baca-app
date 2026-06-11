import crypto from "node:crypto"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import {
  STORAGE_BUCKET,
  getCoverExtension,
  getCoverValidationError,
  getPdfValidationError,
} from "@/lib/upload"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type UploadDescriptor = {
  name: string
  size: number
  type: string
}

type SignUploadRequest = {
  pdf?: UploadDescriptor
  cover?: UploadDescriptor | null
}

function randomId() {
  return crypto.randomBytes(16).toString("hex")
}

function isUploadDescriptor(value: unknown): value is UploadDescriptor {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Partial<UploadDescriptor>

  return (
    typeof candidate.name === "string" &&
    typeof candidate.size === "number" &&
    Number.isFinite(candidate.size) &&
    candidate.size > 0 &&
    typeof candidate.type === "string"
  )
}

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"
    const rl = checkRateLimit(`upload:sign:${ip}`, 20, 60000)

    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak percobaan upload. Coba lagi nanti." }, { status: 429 })
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

    const body = (await request.json()) as SignUploadRequest

    if (!isUploadDescriptor(body.pdf)) {
      return NextResponse.json({ error: "Informasi file PDF tidak valid" }, { status: 400 })
    }

    const pdfError = getPdfValidationError(body.pdf)
    if (pdfError) {
      return NextResponse.json({ error: pdfError }, { status: 400 })
    }

    if (body.cover != null && !isUploadDescriptor(body.cover)) {
      return NextResponse.json({ error: "Informasi file cover tidak valid" }, { status: 400 })
    }

    const coverError = body.cover ? getCoverValidationError(body.cover) : null
    if (coverError) {
      return NextResponse.json({ error: coverError }, { status: 400 })
    }

    const pdfPath = `pdf/${randomId()}.pdf`
    const { data: pdfSignedData, error: pdfSignedError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(pdfPath)

    if (pdfSignedError || !pdfSignedData?.token) {
      console.error("Create PDF signed upload URL error:", pdfSignedError)
      return NextResponse.json({ error: "Gagal menyiapkan upload PDF" }, { status: 500 })
    }

    let cover: { path: string; token: string } | null = null

    if (body.cover) {
      const coverPath = `covers/${randomId()}.${getCoverExtension(body.cover.name)}`
      const { data: coverSignedData, error: coverSignedError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .createSignedUploadUrl(coverPath)

      if (coverSignedError || !coverSignedData?.token) {
        console.error("Create cover signed upload URL error:", coverSignedError)
        return NextResponse.json({ error: "Gagal menyiapkan upload cover" }, { status: 500 })
      }

      cover = {
        path: coverPath,
        token: coverSignedData.token,
      }
    }

    return NextResponse.json({
      pdf: {
        path: pdfPath,
        token: pdfSignedData.token,
      },
      cover,
    })
  } catch (error) {
    console.error("Signed upload preparation error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat menyiapkan upload" }, { status: 500 })
  }
}
