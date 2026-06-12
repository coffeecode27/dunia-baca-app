"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, Check, X } from "lucide-react"
import Link from "next/link"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories)
  }, [])

  async function addCategory() {
    if (!newName.trim()) return
    setLoading(true)
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (!res.ok) { toast.error("Gagal"); setLoading(false); return }
    const cat = await res.json()
    setCategories([...categories, cat])
    setNewName("")
    setLoading(false)
    toast.success("Kategori ditambah")
  }

  async function updateCategory(id: string) {
    if (!editingName.trim()) return
    setLoading(true)
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName.trim() }),
    })
    if (!res.ok) { toast.error("Gagal"); setLoading(false); return }
    setCategories(categories.map(c => c.id === id ? { ...c, name: editingName.trim() } : c))
    setEditingId(null)
    setLoading(false)
    toast.success("Kategori diupdate")
  }

  async function deleteCategory(id: string) {
    if (!confirm("Hapus kategori?")) return
    setLoading(true)
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
    if (!res.ok) { toast.error("Gagal"); setLoading(false); return }
    setCategories(categories.filter(c => c.id !== id))
    setLoading(false)
    toast.success("Kategori dihapus")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Kategori</h1>
        <p className="mt-1 text-muted-foreground">{categories.length} kategori</p>
      </div>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nama kategori baru..."
          onKeyDown={e => e.key === "Enter" && addCategory()}
          className="h-9 flex-1 rounded-md border-2 border-border bg-background px-3 text-sm shadow-[2px_2px_0px_0px_#000000] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button onClick={addCategory} disabled={loading} size="sm"><Plus className="h-4 w-4 mr-1" />Tambah</Button>
      </div>

      <div className="space-y-2">
        {categories.map(cat => (
          <Card key={cat.id}>
            <CardContent className="flex items-center gap-3 p-3">
              {editingId === cat.id ? (
                <input
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && updateCategory(cat.id)}
                  className="h-8 flex-1 rounded-md border-2 border-border bg-background px-3 text-sm shadow-[2px_2px_0px_0px_#000000] outline-none"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm font-semibold">{cat.name}</span>
              )}
              {editingId === cat.id ? (
                <>
                  <Button variant="default" size="icon-xs" onClick={() => updateCategory(cat.id)}><Check className="h-3 w-3" /></Button>
                  <Button variant="outline" size="icon-xs" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" size="icon-xs" onClick={() => { setEditingId(cat.id); setEditingName(cat.name) }}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="destructive" size="icon-xs" onClick={() => deleteCategory(cat.id)}><Trash2 className="h-3 w-3" /></Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
