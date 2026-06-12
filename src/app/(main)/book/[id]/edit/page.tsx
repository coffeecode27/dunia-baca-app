"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
}

export default function EditBookPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { status } = useSession()
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState("")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [currentCover, setCurrentCover] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setAllCategories)
    fetch(`/api/books/${id}`).then(r => r.json()).then(data => {
      setTitle(data.title)
      setDescription(data.description || "")
      setCurrentCover(data.coverUrl)
      setSelectedCategories(data.categoryIds || [])
    })
  }, [id])

  function toggleCategory(catId: string) {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    )
  }

  if (status === "loading") return null
  if (status === "unauthenticated") { router.push("/login"); return null }

  async function handleSubmit() {
    setSaving(true)
    const formData = new FormData()
    formData.append("description", description)
    formData.append("categoryIds", JSON.stringify(selectedCategories))
    if (coverFile) formData.append("cover", coverFile)

    const res = await fetch(`/api/books/${id}`, { method: "PATCH", body: formData })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error || "Gagal update"); setSaving(false); return }
    toast.success("Buku berhasil diupdate")
    router.push(`/book/${id}?t=${Date.now()}`)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Buku</h1>
        <p className="text-muted-foreground">{title}</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Kategori</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={cn(
                  "rounded-md border-2 px-3 py-1.5 text-xs font-semibold transition-all",
                  selectedCategories.includes(cat.id)
                    ? "border-border bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_#000000]"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Deskripsi</CardTitle></CardHeader>
        <CardContent>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            className="flex min-h-[100px] w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_#000000] outline-none resize-none focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder="Deskripsi buku..." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Cover</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(coverPreview || currentCover) && (
            <div className="mx-auto w-40 overflow-hidden rounded-md border-2 border-border bg-muted shadow-[2px_2px_0px_0px_#000000]">
              <img src={coverPreview || currentCover || ""} alt="Cover" className="aspect-[3/4] w-full object-cover" />
            </div>
          )}
          <input type="file" accept=".jpg,.jpeg,.png,.webp"
            onChange={e => {
              const f = e.target.files?.[0] ?? null
              setCoverFile(f)
              if (coverPreview) URL.revokeObjectURL(coverPreview)
              setCoverPreview(f ? URL.createObjectURL(f) : null)
            }}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80" />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} className="flex-1" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
        <Link href={`/book/${id}`} className="flex-1"><Button variant="outline" className="w-full" disabled={saving}>Batal</Button></Link>
      </div>
    </div>
  )
}
