import { SessionProvider } from "next-auth/react"
import Navbar from "@/components/layout/Navbar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <Navbar />
      {children}
    </SessionProvider>
  )
}
