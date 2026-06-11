"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { uploadBookSchema, type UploadBookInput } from "@/lib/validations"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Clock, Ban } from "lucide-react"

export default function UploadPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)

  const form = useForm<UploadBookInput>({
    resolver: zodResolver(uploadBookSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
    },
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return null
  }

  if (status === "unauthenticated") {
    return null
  }

  if (session?.user?.status !== "ACTIVE") {
    const isBanned = session?.user?.status === "BANNED"

    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-border shadow-[3px_3px_0px_0px_#000000] ${isBanned ? "bg-red-50" : "bg-yellow-50"}`}>
          {isBanned ? (
            <Ban className="h-10 w-10 text-red-600" />
          ) : (
            <Clock className="h-10 w-10 text-yellow-600" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {isBanned ? "Akun Dinonaktifkan" : "Menunggu Persetujuan"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isBanned
              ? "Akunmu telah dinonaktifkan oleh admin. Kamu masih bisa membaca ebook di perpustakaan, tapi tidak bisa upload."
              : "Akunmu sedang dalam proses review oleh admin. Kamu sudah bisa membaca ebook di perpustakaan, tapi untuk upload ebook, akunmu harus disetujui terlebih dahulu."}
          </p>
        </div>
        {!isBanned && (
          <div className="rounded-md border-2 border-border bg-card p-4 text-left text-sm text-muted-foreground shadow-[2px_2px_0px_0px_#000000]">
            <p className="font-semibold text-foreground">Apa yang harus dilakukan?</p>
            <p className="mt-1">
              Hubungi admin melalui halaman{" "}
              <Link href="/contact" className="font-medium text-primary hover:underline">
                Kontak
              </Link>{" "}
              atau email ke <span className="font-medium text-foreground">imamsuranda@gmail.com</span> untuk mempercepat proses persetujuan akunmu sebagai uploader.
            </p>
          </div>
        )}
        <Link href="/library" className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}>
          Kembali ke Perpustakaan
        </Link>
      </div>
    )
  }

  async function onSubmit(values: UploadBookInput) {
    if (!pdfFile) {
      toast.error("Pilih file PDF terlebih dahulu")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("author", values.author)
      if (values.description) formData.append("description", values.description)
      formData.append("pdf", pdfFile)
      if (coverFile) formData.append("cover", coverFile)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Upload gagal")
        return
      }

      toast.success("Buku berhasil diupload!")
      router.push("/library?tab=koleksi")
    } catch {
      toast.error("Terjadi kesalahan saat upload")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Ebook</h1>
        <p className="mt-1 text-muted-foreground">
          Bagikan ebook Anda dengan komunitas Dunia Baca
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Buku</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul *</FormLabel>
                    <FormControl>
                      <input
                        className="flex h-10 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_#000000] transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        placeholder="Judul ebook"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penulis *</FormLabel>
                    <FormControl>
                      <input
                        className="flex h-10 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_#000000] transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        placeholder="Nama penulis"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (opsional)</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_#000000] transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                        placeholder="Deskripsi singkat tentang buku..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>File PDF *</FormLabel>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    setPdfFile(file)
                    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
                    setPdfPreviewUrl(file ? URL.createObjectURL(file) : null)
                  }}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                />
                {pdfFile && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                    {pdfPreviewUrl && (
                      <div className="overflow-hidden rounded-md border-2 border-border bg-white shadow-[2px_2px_0px_0px_#000000]">
                        <iframe
                          src={pdfPreviewUrl}
                          className="h-40 w-full"
                          title="PDF Preview"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <FormLabel>Cover (opsional)</FormLabel>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    setCoverFile(file)
                    if (coverPreview) URL.revokeObjectURL(coverPreview)
                    setCoverPreview(file ? URL.createObjectURL(file) : null)
                  }}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                />
                {coverFile && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {coverFile.name} ({(coverFile.size / 1024).toFixed(0)} KB)
                    </p>
                    {coverPreview && (
                      <div className="mx-auto w-32 overflow-hidden rounded-md border-2 border-border bg-muted shadow-[2px_2px_0px_0px_#000000]">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="aspect-[3/4] w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Mengupload..." : "Upload Ebook"}
                </Button>
                <Button type="button" variant="destructive" className="flex-1" onClick={() => router.back()} disabled={loading}>
                  Batal
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
