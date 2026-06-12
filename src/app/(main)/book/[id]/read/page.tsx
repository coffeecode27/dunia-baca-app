"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import type * as pdfjsDist from "pdfjs-dist"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, PanelLeft } from "lucide-react"
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
  const renderTaskRef = useRef<any>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [zoom, setZoom] = useState(1)

  useEffect(() => { if (status === "unauthenticated") router.push("/login") }, [status, router])

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
        if (!cancelled) { setPdfDoc(doc); setTotalPages(doc.numPages); setPageNum(Math.min(startFromPage, doc.numPages)); setLoading(false) }
      } catch (err) {
        if (!cancelled) { console.error(err); setError("Gagal memuat PDF"); setLoading(false) }
      }
    }
    if (status !== "loading" && status !== "unauthenticated") loadPdf()
    return () => {
      cancelled = true
      if (renderTaskRef.current) { renderTaskRef.current.cancel(); renderTaskRef.current = null }
      if (pdfDoc) { pdfDoc.destroy(); setPdfDoc(null) }
    }
  }, [id, status])

  const renderPage = useCallback((num: number) => {
    if (!pdfDoc || !canvasRef.current) return
    if (renderTaskRef.current) { renderTaskRef.current.cancel(); renderTaskRef.current = null }
    const canvas = canvasRef.current
    pdfDoc.getPage(num).then((page: any) => {
      const container = containerRef.current
      if (!container) return
      const dpr = window.devicePixelRatio || 1
      const containerWidth = container.clientWidth
      const baseViewport = page.getViewport({ scale: 1 })
      const scale = (containerWidth * dpr * zoom) / baseViewport.width
      const scaledViewport = page.getViewport({ scale })
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height
      canvas.style.width = `${(scaledViewport.width / dpr)}px`
      canvas.style.height = "auto"

      renderTaskRef.current = page.render({ canvas, viewport: scaledViewport })
    })
  }, [pdfDoc, zoom])

  useEffect(() => { if (pageNum > 0 && pageNum <= totalPages) renderPage(pageNum) }, [pageNum, totalPages, renderPage])
  useEffect(() => { if (pageNum > 0) renderPage(pageNum) }, [showSidebar])
  useEffect(() => { function h() { renderPage(pageNum) }; window.addEventListener("resize", h); return () => window.removeEventListener("resize", h) }, [pageNum, renderPage])

  function saveProgress(page: number) {
    if (!session?.user || !id) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetch("/api/reading-progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookId: id, currentPage: page, totalPages }) })
    }, 2000)
  }

  function goToPage(num: number) { if (num < 1 || num > totalPages) return; setPageNum(num); saveProgress(num) }

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goToPage(pageNum + 1)
      if (e.key === "ArrowLeft") goToPage(pageNum - 1)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [pageNum, totalPages])

  // Swipe navigation
  const touchStart = useRef(0)
  useEffect(() => {
    function handleTouchStart(e: TouchEvent) { touchStart.current = e.touches[0].clientX }
    function handleTouchEnd(e: TouchEvent) {
      const diff = touchStart.current - e.changedTouches[0].clientX
      if (Math.abs(diff) > 60) {
        if (diff > 0) goToPage(pageNum + 1)
        else goToPage(pageNum - 1)
      }
    }
    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchend", handleTouchEnd, { passive: true })
    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [pageNum, totalPages])

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><p className="font-semibold">Memuat...</p></div>
  if (error) return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><p className="font-semibold text-destructive">{error}</p><Link href={`/book/${id}`} className={cn(buttonVariants({ variant: "outline" }))}>Kembali</Link></div>

  return (
    <div className="flex gap-3 relative">
      {showSidebar && (
        <div className="absolute sm:relative z-20 left-0 sm:left-auto top-0 w-36 sm:w-28 shrink-0 flex flex-col gap-0.5 overflow-y-auto rounded-md border-2 border-border bg-card p-1 shadow-[2px_2px_0px_0px_#000000]" style={{ maxHeight: "80vh", position: "sticky", top: "4rem" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => goToPage(p)} className={`rounded px-2 py-1 text-left text-xs font-semibold ${p === pageNum ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Hal. {p}</button>
          ))}
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center justify-between gap-2 rounded-md border-2 border-border bg-card p-2 shadow-[2px_2px_0px_0px_#000000]">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="outline" size="icon-sm" onClick={() => setShowSidebar(!showSidebar)}><PanelLeft className="h-4 w-4" /></Button>
            <h2 className="truncate text-sm font-semibold">{book?.title}</h2>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="rounded border border-border px-1.5 py-0.5 hover:bg-muted text-xs font-semibold">−</button>
            <span className="text-xs font-semibold w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="rounded border border-border px-1.5 py-0.5 hover:bg-muted text-xs font-semibold">+</button>
          </div>
        </div>

        <div ref={containerRef} className="w-full overflow-x-auto rounded-md border-2 border-border bg-white shadow-[2px_2px_0px_0px_#000000] p-1">
          <canvas ref={canvasRef} />
        </div>

        <div className="flex items-center justify-between gap-2 rounded-md border-2 border-border bg-card p-2 shadow-[2px_2px_0px_0px_#000000]">
          <Button variant="outline" size="icon-sm" onClick={() => goToPage(pageNum - 1)} disabled={pageNum <= 1}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="flex items-center gap-1">
            <input type="text" inputMode="numeric" value={pageNum} onChange={e => { const v = e.target.value.replace(/\D/g, ""); if (!v) { setPageNum(1); return }; const n = Number(v); if (n >= 1 && n <= totalPages) goToPage(n) }} onFocus={e => e.target.select()} className="h-8 w-16 rounded-md border-2 border-border bg-background text-center text-sm font-semibold shadow-[2px_2px_0px_0px_#000000] outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
            <span className="text-xs text-muted-foreground">/ {totalPages}</span>
          </div>
          <Button variant="outline" size="icon-sm" onClick={() => goToPage(pageNum + 1)} disabled={pageNum >= totalPages}><ChevronRight className="h-4 w-4" /></Button>
        </div>

        <Link href={`/book/${id}`} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>Kembali ke Detail</Link>
      </div>
    </div>
  )
}
