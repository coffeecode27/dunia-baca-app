import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Users, BookOpen, BookMarked, ArrowRight } from "lucide-react"

export default async function AdminDashboard() {
  const [totalUsers, totalBooks, pendingBooks] = await Promise.all([
    prisma.user.count(),
    prisma.book.count(),
    prisma.book.count({ where: { status: "PENDING" } }),
  ])

  const stats = [
    {
      label: "Total User",
      value: totalUsers,
      icon: Users,
      color: "bg-primary",
      href: "/admin/users",
    },
    {
      label: "Total Ebook",
      value: totalBooks,
      icon: BookOpen,
      color: "bg-accent",
      href: "/admin/books",
    },
    {
      label: "Pending Review",
      value: pendingBooks,
      icon: BookMarked,
      color: "bg-destructive",
      href: "/admin/books",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Ringkasan platform Dunia Baca</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="group transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#000000]">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-border ${stat.color} shadow-[2px_2px_0px_0px_#000000]`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
