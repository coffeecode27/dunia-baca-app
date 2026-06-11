import { NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import path from "node:path"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params

  const safePath = pathSegments.join("/")
  const filePath = path.join(process.cwd(), "uploads", safePath)

  if (!filePath.startsWith(path.join(process.cwd(), "uploads"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const buffer = await readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()

    const contentTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentTypes[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 })
  }
}
