"use client"

import { useState, useEffect, useRef, type ChangeEvent } from "react"
import Link from "next/link"
import Image from "next/image"
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
import { supabase } from "@/lib/supabase"
import {
  STORAGE_BUCKET,
  formatFileSize,
  getCoverValidationError,
  getPdfValidationError,
} from "@/lib/upload"
import { toast } from "sonner"
import { Clock, Ban } from "lucide-react"

type SignedUploadPayload = {
  pdf: {
    path: string
    token: string
  }
  cover: {
    path: string
    token: string
  } | null
  error?: string
}

export default function UploadPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Mengupload...")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [coverError, setCoverError] = useState<string | null>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setAllCategories)
  }, [])

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

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl)
      }
    }
  }, [pdfPreviewUrl])

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview)
      }
    }
  }, [coverPreview])

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

  function clearPdfSelection(input?: HTMLInputElement | null) {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl)
    }

    setPdfFile(null)
    setPdfPreviewUrl(null)

    const target = input ?? pdfInputRef.current
    if (target) {
      target.value = ""
    }
  }

  function clearCoverSelection(input?: HTMLInputElement | null) {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview)
    }

    setCoverFile(null)
    setCoverPreview(null)

    const target = input ?? coverInputRef.current
    if (target) {
      target.value = ""
    }
  }

  function handlePdfChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    clearPdfSelection(event.target)

    if (!file) {
      setPdfError(null)
      return
    }

    const validationError = getPdfValidationError(file)
    if (validationError) {
      setPdfError(validationError)
      toast.error(validationError)
      return
    }

    setPdfError(null)
    setPdfFile(file)
    setPdfPreviewUrl(URL.createObjectURL(file))
  }

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    clearCoverSelection(event.target)

    if (!file) {
      setCoverError(null)
      return
    }

    const validationError = getCoverValidationError(file)
    if (validationError) {
      const message = validationError.includes("5MB")
        ? "Ukuran cover maksimal 5MB. Preview dibatalkan, silakan kompres gambar terlebih dahulu."
        : validationError

      setCoverError(message)
      toast.error(message)
      return
    }

    setCoverError(null)
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function onSubmit(values: UploadBookInput) {
    if (!pdfFile) {
      toast.error("Pilih file PDF terlebih dahulu")
      return
    }

    if (pdfError || coverError) {
      toast.error("Perbaiki file yang tidak valid sebelum upload")
      return
    }

    setLoading(true)
    setLoadingMessage("Menyiapkan upload...")

    try {
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdf: {
            name: pdfFile.name,
            size: pdfFile.size,
            type: pdfFile.type,
          },
          cover: coverFile
            ? {
                name: coverFile.name,
                size: coverFile.size,
                type: coverFile.type,
              }
            : null,
        }),
      })

      const signedUpload = (await signRes.json()) as SignedUploadPayload

      if (!signRes.ok) {
        toast.error(signedUpload.error || "Gagal menyiapkan upload")
        return
      }

      setLoadingMessage("Mengupload PDF ke penyimpanan...")

      const { error: pdfUploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .uploadToSignedUrl(signedUpload.pdf.path, signedUpload.pdf.token, pdfFile, {
          contentType: pdfFile.type,
          upsert: false,
        })

      if (pdfUploadError) {
        toast.error("Gagal upload file PDF")
        return
      }

      if (coverFile) {
        if (!signedUpload.cover) {
          toast.error("Token upload cover tidak tersedia")
          return
        }

        setLoadingMessage("Mengupload cover ke penyimpanan...")

        const { error: coverUploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .uploadToSignedUrl(signedUpload.cover.path, signedUpload.cover.token, coverFile, {
            contentType: coverFile.type,
            upsert: false,
          })

        if (coverUploadError) {
          toast.error("Gagal upload cover")
          return
        }
      }

      setLoadingMessage("Menyimpan metadata buku...")

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          author: values.author,
          description: values.description || undefined,
          categoryIds: selectedCategories,
          pdf: {
            path: signedUpload.pdf.path,
            size: pdfFile.size,
          },
          cover:
            coverFile && signedUpload.cover
              ? {
                  path: signedUpload.cover.path,
                  size: coverFile.size,
                }
              : null,
        }),
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
      setLoadingMessage("Mengupload...")
    }
  }

  const submitDisabled = loading || !pdfFile || Boolean(pdfError) || Boolean(coverError)

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
                        className="flex min-h-20 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm shadow-[2px_2px_0px_0px_#000000] transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                        placeholder="Deskripsi singkat tentang buku..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Kategori</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setSelectedCategories(prev =>
                          prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                        )
                      }}
                      className={`rounded-md border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedCategories.includes(cat.id)
                          ? "border-border bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_#000000]"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>File PDF *</FormLabel>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                />
                <p className="text-xs text-muted-foreground">Format PDF, maksimal 50MB.</p>
                {pdfError && <p className="text-xs font-medium text-destructive">{pdfError}</p>}
                {pdfFile && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {pdfFile.name} ({formatFileSize(pdfFile.size)})
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
                  ref={coverInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleCoverChange}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                />
                <p className="text-xs text-muted-foreground">JPG, PNG, atau WebP maksimal 5MB.</p>
                {coverError && <p className="text-xs font-medium text-destructive">{coverError}</p>}
                {coverFile && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {coverFile.name} ({formatFileSize(coverFile.size)})
                    </p>
                    {coverPreview && (
                      <div className="mx-auto w-32 overflow-hidden rounded-md border-2 border-border bg-muted shadow-[2px_2px_0px_0px_#000000]">
                        <Image
                          src={coverPreview}
                          alt="Cover preview"
                          width={192}
                          height={256}
                          unoptimized
                          className="aspect-3/4 w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={submitDisabled}>
                  {loading ? loadingMessage : "Upload Ebook"}
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
