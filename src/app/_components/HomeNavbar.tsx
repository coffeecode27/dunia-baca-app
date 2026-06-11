"use client"

import { SessionProvider } from "next-auth/react"
import Navbar from "@/components/layout/Navbar"

export function HomeNavbar() {
  return (
    <SessionProvider>
      <Navbar />
    </SessionProvider>
  )
}
