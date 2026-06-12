import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  selected?: string
  search?: string
}

export async function CategoryFilter({ selected, search }: CategoryFilterProps) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })

  const buildHref = (catId?: string) => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (catId) params.set("category", catId)
    return `/library?${params.toString()}`
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={buildHref()}
        className={cn(
          "rounded-md border-2 px-3 py-1 text-xs font-semibold transition-all",
          !selected
            ? "border-border bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_#000000]"
            : "border-border bg-card text-muted-foreground hover:bg-muted"
        )}
      >
        Semua
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={buildHref(cat.id)}
          className={cn(
            "rounded-md border-2 px-3 py-1 text-xs font-semibold transition-all",
            selected === cat.id
              ? "border-border bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_#000000]"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
          )}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  )
}
