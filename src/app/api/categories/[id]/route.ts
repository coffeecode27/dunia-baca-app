import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import crypto from "node:crypto"

export async function POST(request: Request) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  const { name } = await request.json()
  if (!name) return NextResponse.json({ error: "Nama wajib" }, { status: 400 })
  const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  const cat = await prisma.category.create({ data: { id, name } })
  return NextResponse.json(cat, { status: 201 })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  const { id } = await params
  const { name } = await request.json()
  if (!name) return NextResponse.json({ error: "Nama wajib" }, { status: 400 })
  await prisma.category.update({ where: { id }, data: { name } })
  return NextResponse.json({ message: "OK" })
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
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ message: "OK" })
}
