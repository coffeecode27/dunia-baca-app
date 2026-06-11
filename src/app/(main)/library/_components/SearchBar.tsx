"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Search } from "lucide-react"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set("search", term)
    } else {
      params.delete("search")
    }
    router.push(`/library?${params.toString()}`)
  }, 300)

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        placeholder="Cari ebook berdasarkan judul atau penulis..."
        className="flex h-10 w-full rounded-md border-2 border-border bg-background px-3 py-2 pl-10 text-sm shadow-[2px_2px_0px_0px_#000000] transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}
