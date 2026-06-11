import { redirect } from "next/navigation"

export default function MyUploadsPage() {
  redirect("/library?tab=koleksi")
}
