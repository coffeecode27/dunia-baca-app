# Dunia Baca — Aturan Pengembangan (Coding Rules)

> **Tujuan**: Konsistensi kode di seluruh project. Semua kode yang ditulis harus mengikuti aturan di bawah.

---

## 1. Aturan Umum

### 1.1 Bahasa
- Semua kode, komentar, nama variabel: **Bahasa Inggris**
- Commit message, dokumentasi, PR description: **Bahasa Indonesia**
- UI text: **Bahasa Indonesia**

### 1.2 Prinsip Inti
- **Simpel dulu**: Jangan over-engineer. Mulai dari yang paling sederhana, refactor kalau perlu.
- **Satu tanggung jawab**: Setiap file/komponen/fungsi hanya melakukan satu hal.
- **Jangan tebak library**: Pastikan library ada di `package.json` sebelum digunakan.

---

## 2. Struktur Project

```
src/
├── app/                    # Next.js App Router (routing + pages)
│   ├── (auth)/             # Route group: login, register
│   ├── (main)/             # Route group: library, book/[id], upload, dll
│   ├── admin/              # Route group: admin pages
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # Shared UI components
│   ├── ui/                 # Primitif (Button, Input, Modal — dari shadcn/ui)
│   ├── layout/             # Navbar, Footer, Sidebar
│   ├── books/              # BookCard, BookGrid, BookDetail, UploadForm
│   ├── reader/             # PDFReader, PageNavigation, ProgressIndicator
│   └── admin/              # Admin-specific components
├── lib/                    # Utilitas dan konfigurasi
│   ├── prisma.ts           # Prisma client singleton
│   ├── auth.ts             # NextAuth config
│   ├── supabase.ts         # Supabase client
│   └── utils.ts            # Helper functions
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── styles/                 # Global styles (jika diperlukan di luar Tailwind)
```

### 2.1 Aturan Penempatan

| Jenis | Tempat |
|-------|--------|
| Komponen yang dipakai di 1 halaman | `app/<route>/_components/` |
| Komponen yang dipakai di 2+ halaman | `components/<kategori>/` |
| Server Component (default) | Langsung di `app/<route>/page.tsx` |
| Client Component | File terpisah dengan `"use client"` di baris 1 |
| Server Actions | `app/<route>/_actions.ts` |

---

## 3. Naming Convention

### 3.1 File & Folder

| Jenis | Konvensi | Contoh |
|-------|----------|--------|
| Komponen React | PascalCase | `BookCard.tsx`, `PdfReader.tsx` |
| Hooks | camelCase + `use` prefix | `useReadingProgress.ts` |
| Utilitas | camelCase | `formatDate.ts`, `cn.ts` |
| Route folder | kebab-case | `my-uploads/`, `reading-progress/` |
| Komponen dalam route | `_components/` | `app/library/_components/BookGrid.tsx` |

### 3.2 Variabel & Fungsi

| Jenis | Konvensi | Contoh |
|-------|----------|--------|
| Variabel | camelCase | `currentPage`, `bookList` |
| Fungsi | camelCase, verb-first | `fetchBook()`, `saveProgress()` |
| Konstanta | UPPER_SNAKE | `MAX_FILE_SIZE`, `ITEMS_PER_PAGE` |
| Tipe/Interface | PascalCase | `Book`, `UploadFormData` |
| Database kolom | camelCase | `currentPage`, `createdAt` |

### 3.3 Route & API

- API route: `/api/[resource]` — RESTful, jamak untuk koleksi
- Dynamic route: `[id]` — identifier pakai `cuid`
- URL: kebab-case — `/my-uploads`, bukan `/myUploads`

---

## 4. TypeScript Rules

### 4.1 Wajib
- **Strict mode** di `tsconfig.json`
- Semua fungsi punya **return type** eksplisit (kecuali return JSX)
- `interface` untuk object shapes, `type` untuk union/intersection
- Tidak boleh pakai `any` — gunakan `unknown` jika benar-benar tidak tahu
- Gunakan `zod` untuk validasi runtime (form input, API body)

### 4.2 Type Import
- Pisahkan type import: `import type { Book } from "@/types"`

---

## 5. Database & Prisma

### 5.1 Query
- Semua query database ada di **Server Component** atau **API Route** — tidak pernah di Client Component
- Gunakan `select` untuk membatasi kolom yang diambil (jangan fetch semua kolom kalau tidak perlu)
- Gunakan `include` atau `select` dengan relasi yang diperlukan saja

### 5.2 Error Handling
- Bungkus query Prisma dengan try-catch
- Error dilempar sebagai `NextResponse` dengan status code yang sesuai
- Jangan expose error message mentah ke client

---

## 6. API Design

### 6.1 Response Format
```typescript
// Sukses
{ "data": T }

// Error
{ "error": "Pesan yang bisa ditampilkan ke user" }

// Paginasi
{ "data": T[], "meta": { "page": 1, "totalPages": 10, "totalItems": 120 } }
```

### 6.2 Status Code
| Kode | Makna |
|------|-------|
| 200 | GET/PATCH sukses |
| 201 | POST sukses (resource created) |
| 400 | Validasi gagal (input user salah) |
| 401 | Belum login |
| 403 | Tidak punya akses (bukan admin) |
| 404 | Resource tidak ditemukan |
| 500 | Server error |

### 6.3 Validasi
- Zod schema untuk setiap API route yang menerima input
- Validasi di server, bukan hanya di client

---

## 7. Komponen & React

### 7.1 Client vs Server
- Default: **Server Component** (tanpa `"use client"`)
- Client Component hanya jika perlu: interaktivitas (`onClick`, `useState`, `useEffect`, event listener), browser API
- Pisahkan komponen interaktif ke file sendiri agar parent tetap server component

### 7.2 Pattern
- Props pakai interface (bukan inline type)
- Jangan mutasi props
- Tidak ada side effect di render (side effect = useEffect, event handler)
- Gunakan Server Actions untuk mutasi data (bukan fetch dari client)

### 7.3 Error Boundary
- Setiap route group punya `error.tsx`
- Setiap route group yang ada data loading punya `loading.tsx`

```tsx
// error.tsx — minimal
"use client"
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <div>Something went wrong. <button onClick={reset}>Try again</button></div>
}
```

---

## 8. State Management

- **URL** untuk state yang perlu shareable (search query, filter, current page)
- **useState** untuk local UI state (modal open, form input)
- **Database** untuk state yang perlu persisten (progress bacaan, data buku)
- **Tidak pakai Redux/Zustand** kecuali benar-benar diperlukan

---

## 9. Auth & Security

### 9.1 NextAuth Rules
- Konfigurasi NextAuth di `src/lib/auth.ts`
- Middleware NextAuth untuk proteksi route
- Session dicek di server component via `auth()` atau di API route
- Role dicek sebelum akses route admin

### 9.2 File Upload
- Validasi tipe MIME, bukan hanya ekstensi
- Batas ukuran file (50MB PDF, 5MB gambar)
- File disimpan di Supabase Storage dengan nama acak (hindari path traversal)
- URL storage pakai signed URL atau RLS policy

---

## 10. Styling (Tailwind CSS + shadcn/ui)

- Gunakan utility classes Tailwind, jangan CSS custom kecuali terpaksa
- Komponen UI primitif pakai shadcn/ui (Button, Input, Dialog, dll.)
- Class sorting: layout → sizing → spacing → typography → visual → misc
- Gunakan `cn()` dari `@/lib/utils` untuk merge class

---

## 11. Git Convention

### 11.1 Branch
- `main` — production-ready
- `feature/<nama-fitur>` — fitur baru
- `fix/<nama-bug>` — perbaikan bug

### 11.2 Commit Message
Format: `<tipe>: <deskripsi singkat>`

| Tipe | Kegunaan |
|------|----------|
| `feat:` | Fitur baru |
| `fix:` | Perbaikan bug |
| `chore:` | Setup, config, dependensi |
| `style:` | Styling, formatting |
| `refactor:` | Perubahan kode tanpa ubah fungsionalitas |

Contoh: `feat: tambah upload ebook dengan progress bar`

---

## 12. Urutan Import

```typescript
// 1. React / Next.js
import { useState } from "react"
import Link from "next/link"

// 2. Third-party
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"

// 3. Internal — types
import type { Book } from "@/types"

// 4. Internal — modules
import { prisma } from "@/lib/prisma"
import { BookCard } from "@/components/books/BookCard"

// 5. Styles / Assets
```

---

## 13. Testing (Opsional untuk MVP)

- Fokus pada integration test untuk API routes
- Unit test untuk fungsi utilitas kritis
- Framework: Vitest + React Testing Library (jika ada waktu)
- Tidak wajib di MVP — tapi struktur harus test-friendly

---

## 14. Checklist Sebelum Commit

- [ ] Tidak ada `console.log` yang tertinggal
- [ ] Tidak ada `any`
- [ ] Tidak ada komentar ngawur / TODO tanpa konteks
- [ ] TypeScript tidak error (`pnpm typecheck`)
- [ ] Lint bersih (`pnpm lint`)
- [ ] Build sukses (`pnpm build`)
- [ ] Tidak ada secret/key yang hardcoded
