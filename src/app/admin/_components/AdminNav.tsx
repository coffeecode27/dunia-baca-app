"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BookOpen, Users, ArrowLeft } from "lucide-react"

export function AdminNav() {
  const pathname = usePathname()

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/books", label: "Buku", icon: BookOpen },
    { href: "/admin/users", label: "User", icon: Users },
  ]

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r-2 border-border bg-muted/20">
      <div className="border-b-2 border-border px-4 py-3">
        <Link href="/admin" className="text-sm font-bold">
          Admin Panel
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_#000000]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t-2 border-border p-3">
        <Link
          href="/library"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
      </div>
    </aside>
  )
}
