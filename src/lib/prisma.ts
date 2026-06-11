import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Serverless (Vercel): transaction pooler (6543). Migrations use DIRECT_URL via prisma.config.ts.
const connectionString =
  process.env.DATABASE_URL ?? process.env.DIRECT_URL!

const pool = new Pool({
  connectionString,
  max: 1,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
