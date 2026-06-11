export const STORAGE_BUCKET = "ebooks"

export const MAX_PDF_SIZE = 50 * 1024 * 1024
export const MAX_COVER_SIZE = 5 * 1024 * 1024

export const ALLOWED_PDF_TYPES = ["application/pdf"] as const
export const ALLOWED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

type UploadFileLike = {
  name: string
  size: number
  type: string
}

export function getPdfValidationError(file: UploadFileLike | null | undefined) {
  if (!file) {
    return null
  }

  if (!ALLOWED_PDF_TYPES.includes(file.type as (typeof ALLOWED_PDF_TYPES)[number])) {
    return "File harus berformat PDF"
  }

  if (file.size > MAX_PDF_SIZE) {
    return "Ukuran PDF maksimal 50MB"
  }

  return null
}

export function getCoverValidationError(file: UploadFileLike | null | undefined) {
  if (!file) {
    return null
  }

  if (!ALLOWED_COVER_TYPES.includes(file.type as (typeof ALLOWED_COVER_TYPES)[number])) {
    return "Cover harus JPG, PNG, atau WebP"
  }

  if (file.size > MAX_COVER_SIZE) {
    return "Ukuran cover maksimal 5MB"
  }

  return null
}

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return `${Math.ceil(bytes / 1024)} KB`
}

export function getCoverExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase()

  if (extension === "jpg" || extension === "jpeg") {
    return "jpg"
  }

  if (extension === "png" || extension === "webp") {
    return extension
  }

  return "png"
}

export function isValidStoragePath(path: string, prefix: "pdf" | "covers") {
  const pattern =
    prefix === "pdf"
      ? /^pdf\/[a-f0-9]{32}\.pdf$/
      : /^covers\/[a-f0-9]{32}\.(jpg|jpeg|png|webp)$/

  return pattern.test(path)
}
