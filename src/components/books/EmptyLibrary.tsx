import { BookOpenIcon } from "lucide-react"

export function EmptyLibrary() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-6">
        <BookOpenIcon className="h-12 w-12 text-muted-foreground/60" />
      </div>
      <h2 className="mt-6 text-lg font-semibold">Belum ada ebook</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Belum ada ebook yang tersedia. Jadilah yang pertama mengupload ebook untuk berbagi literasi!
      </p>
    </div>
  )
}
