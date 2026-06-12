"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import type * as pdfjsDist from "pdfjs-dist"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

let pdfjsLib: typeof pdfjsDist | null = null

export default function ReadPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const startFromPage = Number(searchParams.get("page")) || 1
  const router = useRouter()
  const { data: session, status } = useSession()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [book, setBook] = useState<{ title: string; fileUrl: string } | null>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [pageNum, setPageNum] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    let cancelled = false

    async function loadPdf() {
      try {
        const res = await fetch(`/api/books/${id}`)
        const data = await res.json()

        if (data.error) {
          if (!cancelled) setError(data.error)
          if (!cancelled) setLoading(false)
          return
        }

        if (!cancelled) setBook(data)

        if (!data.fileUrl) {
          if (!cancelled) setError("File tidak ditemukan")
          if (!cancelled) setLoading(false)
          return
        }

        if (!pdfjsLib) {
          const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
          pdfjsLib = pdfjs
        }

        const doc = await pdfjsLib.getDocument({
          url: data.fileUrl.startsWith("http")
            ? data.fileUrl
            : window.location.origin + data.fileUrl,
        }).promise

        if (!cancelled) {
          setPdfDoc(doc)
          setTotalPages(doc.numPages)
          setPageNum(Math.min(startFromPage, doc.numPages))
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError("Gagal memuat PDF")
          setLoading(false)
        }
      }
    }

    if (status !== "unauthenticated") loadPdf()

    return () => {
      cancelled = true
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
      if (pdfDoc) {
        pdfDoc.destroy()
        setPdfDoc(null)
      }
    }
  }, [id, status])

  const renderTaskRef = useRef<any>(null)

  const renderPage = useCallback(
    (num: number) => {
      if (!pdfDoc || !canvasRef.current) return
      
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }

      const canvas = canvasRef.current
      pdfDoc.getPage(num).then((page: any) => {
        const container = containerRef.current
        if (!container) return

        const dpr = window.devicePixelRatio || 1
        const containerWidth = container.clientWidth
        const baseViewport = page.getViewport({ scale: 1 })
        const scale = (containerWidth * dpr) / baseViewport.width
        const scaledViewport = page.getViewport({ scale })

        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height
        canvas.style.width = `${containerWidth}px`
        canvas.style.height = "auto"

        renderTaskRef.current = page.render({
          canvas,
          viewport: scaledViewport,
        })
      })
    },
    [pdfDoc]
  )

  useEffect(() => {
    if (pageNum > 0 && pageNum <= totalPages) {
      renderPage(pageNum)
    }
  }, [pageNum, totalPages, renderPage])

  useEffect(() => {
    function handleResize() {
      renderPage(pageNum)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [pageNum, renderPage])

  function saveProgress(page: number) {
    if (!session?.user || !id) return

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetch("/api/reading-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: id, currentPage: page, totalPages }),
      })
    }, 2000)
  }

  function goToPage(num: number) {
    if (num < 1 || num > totalPages) return
    setPageNum(num)
    saveProgress(num)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-semibold">Memuat PDF...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="font-semibold text-destructive">{error}</p>
        <Link href={`/book/${id}`} className={cn(buttonVariants({ variant: "outline" }))}>
          Kembali
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 rounded-md border-2 border-border bg-card p-3 shadow-[2px_2px_0px_0px_#000000]">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{book?.title}</h2>
          <p className="text-xs text-muted-foreground">
            Halaman {pageNum} dari {totalPages}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => goToPage(pageNum - 1)}
            disabled={pageNum <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <input
            type="number"
            min={1}
            max={totalPages}
            value={pageNum}
            onChange={(e) => goToPage(Number(e.target.value))}
            className="h-8 w-14 rounded-md border-2 border-border bg-background text-center text-sm font-semibold shadow-[2px_2px_0px_0px_#000000] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => goToPage(pageNum + 1)}
            disabled={pageNum >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex justify-center rounded-md border-2 border-border bg-white p-2 shadow-[4px_4px_0px_0px_#000000]"
      >
        <canvas ref={canvasRef} />
      </div>

      <Link
        href={`/book/${id}`}
        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      >
        Kembali ke Detail
      </Link>
    </div>
  )
}
