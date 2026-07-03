"use client"

import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"

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
    <div className="relative w-44 shrink-0">
      <select
        value={selected || ""}
        onChange={(e) => handleChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-md border-2 border-border bg-background pl-3 pr-8 text-sm font-semibold shadow-[2px_2px_0px_0px_#000000] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">Semua Kategori</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
