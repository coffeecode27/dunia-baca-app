"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import type * as pdfjsDist from "pdfjs-dist"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PanelLeft } from "lucide-react"
import Link from "next/link"

let pdfjsLib: typeof pdfjsDist | null = null

export default function ReadPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const startFromPage = Number(searchParams.get("page")) || 1
  const router = useRouter()
  const { data: session, status } = useSession()
  const scrollRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<Map<number, HTMLCanvasElement>>(new Map())

  const [book, setBook] = useState<{ title: string; fileUrl: string } | null>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [zoom, setZoom] = useState(1.5)
  const renderedPages = useRef(new Set<number>())
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    let cancelled = false
    async function loadPdf() {
      try {
        const res = await fetch(`/api/books/${id}`)
        const data = await res.json()
        if (data.error) { if (!cancelled) { setError(data.error); setLoading(false) } return }
        if (!cancelled) setBook(data)
        if (!data.fileUrl) { if (!cancelled) { setError("File tidak ditemukan"); setLoading(false) } return }
        if (!pdfjsLib) {
          const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
          pdfjsLib = pdfjs
        }
        const doc = await pdfjsLib.getDocument({
          url: data.fileUrl.startsWith("http") ? data.fileUrl : window.location.origin + data.fileUrl,
        }).promise
        if (!cancelled) {
          setPdfDoc(doc)
          setTotalPages(doc.numPages)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) { console.error(err); setError("Gagal memuat PDF"); setLoading(false) }
      }
    }
    if (status !== "loading" && status !== "unauthenticated") loadPdf()
    return () => { cancelled = true }
  }, [id, status])

  const renderPageToCanvas = useCallback(async (pageNum: number, canvas: HTMLCanvasElement) => {
    if (!pdfDoc || !pdfjsLib || renderedPages.current.has(pageNum)) return
    renderedPages.current.add(pageNum)
    try {
      const page = await pdfDoc.getPage(pageNum)
      const dpr = window.devicePixelRatio || 1
      const containerWidth = canvas.parentElement?.clientWidth || window.innerWidth
      const baseViewport = page.getViewport({ scale: 1 })
      const scale = (containerWidth * dpr * zoom) / baseViewport.width
      const scaledViewport = page.getViewport({ scale })
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height
      canvas.style.width = `${containerWidth}px`
      canvas.style.height = `${(scaledViewport.height / dpr)}px`
      await page.render({ canvas, viewport: scaledViewport }).promise
    } catch {}
  }, [pdfDoc, zoom])

  useEffect(() => {
    renderedPages.current.clear()
    pagesRef.current.forEach((canvas, pageNum) => renderPageToCanvas(pageNum, canvas))
  }, [zoom, renderPageToCanvas])

  useEffect(() => {
    if (!scrollRef.current || totalPages === 0) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pageNum = Number((entry.target as HTMLElement).dataset.page)
          if (pageNum) {
            setCurrentPage(pageNum)
            const canvas = pagesRef.current.get(pageNum)
            if (canvas) renderPageToCanvas(pageNum, canvas)
          }
        }
      })
    }, { rootMargin: "200px" })

    scrollRef.current.querySelectorAll("[data-page]").forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [totalPages, renderPageToCanvas])

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

  useEffect(() => {
    if (currentPage > 0) saveProgress(currentPage)
  }, [currentPage])

  function scrollToPage(p: number) {
    const el = document.querySelector(`[data-page="${p}"]`)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><p className="font-semibold">Memuat...</p></div>
  if (error) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="font-semibold text-destructive">{error}</p>
      <Link href={`/book/${id}`} className={cn(buttonVariants({ variant: "outline" }))}>Kembali</Link>
    </div>
  )

  return (
    <div className="flex gap-3">
      {/* Sidebar */}
      {showSidebar && (
        <div className="hidden sm:flex w-28 shrink-0 flex-col gap-0.5 overflow-y-auto rounded-md border-2 border-border bg-card p-1 shadow-[2px_2px_0px_0px_#000000]" style={{ maxHeight: "80vh", position: "sticky", top: "4rem" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => scrollToPage(p)}
              className={`rounded px-2 py-1 text-left text-xs font-semibold transition-colors ${p === currentPage ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              Hal. {p}
            </button>
          ))}
        </div>
      )}

      {/* Main */}
      <div className="min-w-0 flex-1 space-y-3">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 rounded-md border-2 border-border bg-card p-2 shadow-[2px_2px_0px_0px_#000000]">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="outline" size="icon-sm" onClick={() => setShowSidebar(!showSidebar)}>
              <PanelLeft className="h-4 w-4" />
            </Button>
            <h2 className="truncate text-sm font-semibold">{book?.title}</h2>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setZoom(z => Math.max(0.75, z - 0.25))} className="rounded border border-border px-1.5 py-0.5 hover:bg-muted text-xs font-semibold">−</button>
            <span className="text-xs font-semibold w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="rounded border border-border px-1.5 py-0.5 hover:bg-muted text-xs font-semibold">+</button>
          </div>
        </div>

        {/* Scrollable pages */}
        <div ref={scrollRef}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <div key={p} data-page={p} className="mb-3 rounded-md border-2 border-border bg-white shadow-[2px_2px_0px_0px_#000000] overflow-hidden p-1">
              <canvas
                ref={(el) => { if (el) pagesRef.current.set(p, el) }}
              />
            </div>
          ))}
        </div>

        <Link href={`/book/${id}`} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>Kembali ke Detail</Link>
      </div>
    </div>
  )
}
