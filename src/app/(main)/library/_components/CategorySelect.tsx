"use client"

import { useRouter } from "next/navigation"

interface Props {
  categories: { id: string; name: string }[]
  selected?: string
  search?: string
}

export function CategorySelect({ categories, selected, search }: Props) {
  const router = useRouter()

  function handleChange(value: string) {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (value) params.set("category", value)
    router.push(`/library?${params.toString()}`)
  }

  return (
    <select
      value={selected || ""}
      onChange={(e) => handleChange(e.target.value)}
      className="h-10 w-full rounded-md border-2 border-border bg-background px-3 text-sm font-semibold shadow-[2px_2px_0px_0px_#000000] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <option value="">Semua Kategori</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
    </select>
  )
}
