"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?"

  const navLinks = [
    { href: "/library", label: "Perpustakaan" },
    { href: "/about", label: "Tentang" },
    { href: "/contact", label: "Kontak" },
    { href: "/faq", label: "FAQ" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <img
            src="/duniabaca-icon.png"
            alt="Dunia Baca"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-md"
          />
          <span>Dunia Baca</span>
        </Link>

        {/* Desktop nav links — center */}
        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-primary after:transition-all",
                  active
                    ? "text-foreground after:w-full"
                    : "text-muted-foreground hover:text-foreground after:w-0 hover:after:w-full"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop auth buttons — right */}
        <div className="hidden items-center gap-2 sm:flex">
          {status === "loading" ? (
            <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-9 w-9 border-2 border-border shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                  <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link href="/library?tab=koleksi" className="w-full">Koleksi Saya</Link>
                  </DropdownMenuItem>
                  {session.user?.role === "ADMIN" && (
                    <DropdownMenuItem>
                      <Link href="/admin" className="w-full">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden rounded-md border-2 border-border p-1.5 shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t-2 border-border bg-background sm:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="border-t-2 border-border px-4 py-3">
            {status === "loading" ? (
              <div className="py-4 text-center text-sm text-muted-foreground">Memuat...</div>
            ) : session ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3">
                  <Avatar className="h-8 w-8 border-2 border-border">
                    <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                </div>
                <Link
                  href="/library?tab=koleksi"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Koleksi Saya
                </Link>
                {session.user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    signOut()
                  }}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full justify-center"
                  )}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className={cn(buttonVariants(), "w-full justify-center")}
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
