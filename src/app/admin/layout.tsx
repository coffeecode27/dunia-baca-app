import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/lib/auth"
import { AdminNav } from "./_components/AdminNav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <AdminNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </SessionProvider>
  )
}
