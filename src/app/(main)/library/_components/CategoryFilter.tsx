import { prisma } from "@/lib/prisma"
import { CategorySelect } from "./CategorySelect"

interface CategoryFilterProps {
  selected?: string
  search?: string
}

export async function CategoryFilter({ selected, search }: CategoryFilterProps) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
  return <CategorySelect categories={categories} selected={selected} search={search} />
}
