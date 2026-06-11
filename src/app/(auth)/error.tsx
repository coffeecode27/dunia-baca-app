"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-bold">Terjadi Kesalahan</h2>
      <p className="text-muted-foreground">
        Maaf, ada masalah saat memuat halaman ini.
      </p>
      <button
        onClick={reset}
        className="rounded-md border-2 border-border bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[3px_3px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000]"
      >
        Coba Lagi
      </button>
    </div>
  )
}
