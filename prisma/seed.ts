import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"
import path from "node:path"

const dbPath = process.env.DATABASE_URL?.replace("file:", "") ?? "./dev.db"

const adapter = new PrismaLibSql({
  url: `file:${path.resolve(dbPath)}`,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@duniabaca.com"
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123456"
  const adminName = process.env.ADMIN_NAME ?? "Admin Dunia Baca"

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log(`Admin already exists: ${adminEmail}`)
    await prisma.$disconnect()
    return
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  })

  console.log(`Admin created:`)
  console.log(`  Email:    ${admin.email}`)
  console.log(`  Password: ${adminPassword}`)
  console.log(`  Role:     ${admin.role}`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
