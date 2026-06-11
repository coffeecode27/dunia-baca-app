import { revalidatePath } from "next/cache"
import { unlink } from "node:fs/promises"
import path from "node:path"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { DeleteUserButton } from "./_components/DeleteUserButton"
import { cn } from "@/lib/utils"
import { User, Shield, Calendar, Ban, CheckCircle } from "lucide-react"

async function banUser(formData: FormData) {
  "use server"

  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") return

  const userId = formData.get("userId") as string
  await prisma.user.update({
    where: { id: userId },
    data: { status: "BANNED" },
  })

  revalidatePath("/admin/users")
}

async function activateUser(formData: FormData) {
  "use server"

  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") return

  const userId = formData.get("userId") as string
  await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  })

  revalidatePath("/admin/users")
}

async function deleteUser(formData: FormData) {
  "use server"

  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") return

  const userId = formData.get("userId") as string
  if (userId === session.user.id) return

  const books = await prisma.book.findMany({
    where: { uploaderId: userId },
    select: { fileUrl: true, coverUrl: true },
  })

  const baseDir = path.join(process.cwd(), "uploads")
  for (const book of books) {
    const filesToDelete = [book.fileUrl, book.coverUrl].filter(Boolean) as string[]
    for (const url of filesToDelete) {
      const fileName = url.split("/").pop()
      if (!fileName) continue
      const isCover = url.includes("/covers/")
      const fp = path.join(baseDir, isCover ? "covers" : "pdf", fileName)
      try { await unlink(fp) } catch {}
    }
  }

  await prisma.user.delete({ where: { id: userId } })

  revalidatePath("/admin/users")
}

export default async function AdminUsersPage() {
  const session = await auth()

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { books: true, readingProgress: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen User</h1>
        <p className="mt-1 text-muted-foreground">{users.length} user terdaftar</p>
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-border bg-muted shadow-[2px_2px_0px_0px_#000000]">
                {user.role === "ADMIN" ? (
                  <Shield className="h-5 w-5 text-primary" />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{user.name}</h3>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                  {user.status === "PENDING" && (
                    <Badge variant="secondary">MENUNGGU</Badge>
                  )}
                  {user.status === "BANNED" && (
                    <Badge variant="destructive">DINONAKTIFKAN</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </span>
                  <span>{user._count.books} buku</span>
                  <span>{user._count.readingProgress} dibaca</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {user.status === "PENDING" && (
                  <form action={activateUser}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className={cn(
                        buttonVariants({ variant: "default", size: "sm" }),
                        "shrink-0 gap-1.5 text-xs"
                      )}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Terima
                    </button>
                  </form>
                )}
                {user.status === "ACTIVE" && (
                  <form action={banUser}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className={cn(
                        buttonVariants({ variant: "secondary", size: "sm" }),
                        "shrink-0 gap-1.5 text-xs"
                      )}
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Nonaktifkan
                    </button>
                  </form>
                )}
                {user.status === "BANNED" && (
                  <form action={activateUser}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className={cn(
                        buttonVariants({ variant: "default", size: "sm" }),
                        "shrink-0 gap-1.5 text-xs"
                      )}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Aktifkan
                    </button>
                  </form>
                )}
                {user.role !== "ADMIN" && (
                  <DeleteUserButton
                    userId={user.id}
                    userName={user.name}
                    deleteUser={deleteUser}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
