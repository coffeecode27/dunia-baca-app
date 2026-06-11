# Dunia Baca — Insight & Pembelajaran

> **Checkpoint pembelajaran.** Setiap kali mempelajari konsep atau teknologi baru selama development, entry baru akan ditambahkan di sini. Bukan hanya "apa", tapi juga "kenapa" dan "bagaimana".

---

## Insight #1 — Spesifikasi dan Aturan Sebelum Kode

**Tanggal**: Awal project  
**Konteks**: Sebelum menulis kode, kita membuat `spec.md` dan `rules.md`.

### Pelajaran: Kenapa spesifikasi itu penting?

Di dunia kerja nyata, sebelum engineer menulis kode, ada dokumen yang disebut **PRD (Product Requirement Document)** dan **Technical Spec**. Fungsinya:

1. **Mencegah "ngasal"** — Tanpa spec, developer cenderung membuat fitur yang tidak diminta, atau melupakan fitur yang penting. Spec memaksa kita berpikir dulu sebelum ngoding.

2. **Satu sumber kebenaran** — Ketika ada pertanyaan "apakah fitur X harus ada?", jawabannya ada di spec. Tidak perlu debat.

3. **Acceptance criteria adalah kontrak** — Setiap user story punya checklist `[ ]`. Kalau semua sudah dicentang, fitur itu SELESAI. Ini mencegah "fitur setengah jadi".

4. **Rules adalah konstitusi kode** — Tim yang berbeda akan menulis kode dengan gaya berbeda. Rules menyamakan gaya, sehingga kode terlihat seperti ditulis oleh satu orang.

### Pola pikir yang dibangun:
```
Pikir → Tulis spesifikasi → Review → Baru ngoding
```
Bukan:
```
Langsung ngoding → Bingung di tengah jalan → Tanya-tanya lagi
```

---

---

## Insight #2 — Fase 1: Setup Project

**Tanggal**: Setup awal  
**Konteks**: Inisialisasi Next.js 16, Prisma 7, NextAuth v5, shadcn/ui, Tailwind v4.

### 2.1 Next.js 16 + Turbopack — "The New Era"

Next.js 16 menggunakan **Turbopack** sebagai default bundler (bukan Webpack). Turbopack dibuat oleh tim yang sama dengan Webpack, tapi ditulis ulang di Rust.

**Kenapa ini penting:**
- **Jauh lebih cepat** — Dev server start dan HMR (Hot Module Replacement) bisa 10x lebih cepat
- **Lebih strict** — Turbopack lebih ketat dalam module resolution. Import yang "kebetulan jalan" di Webpack bisa error di Turbopack. Ini justru bagus karena memaksa kita disiplin.

**Yang kami alami**: Import `@/generated/prisma` tidak bisa karena direktori tersebut tidak punya `index.ts`. Harus import langsung ke `@/generated/prisma/client`. Di Webpack, ini mungkin jalan karena ada fallback behavior.

### 2.2 pnpm — Package Manager yang Efisien

**Kenapa pnpm, bukan npm/yarn?**
- **Disk space** — pnpm menggunakan content-addressable storage. Package yang sama di project berbeda hanya disimpan SATU KALI di disk.
- **Strict** — pnpm tidak mengizinkan package A meng-import dependency dari package B kecuali package A mendeklarasikannya. Ini mencegah "phantom dependency" (kode yang jalan tapi tidak ada di package.json).

**Yang kami alami**: pnpm punya fitur `onlyBuiltDependencies` yang harus di-set di `pnpm-workspace.yaml` agar Prisma bisa menjalankan build script-nya saat install.

### 2.3 Prisma 7 — Breaking Changes dari v6

Prisma 7 adalah major version dengan perubahan signifikan:

| Prisma 6 | Prisma 7 |
|----------|----------|
| `new PrismaClient()` — tanpa argumen | `new PrismaClient({ adapter })` — WAJIB pakai adapter |
| Konfigurasi datasource di schema.prisma | Konfigurasi datasource di `prisma.config.ts` |
| Client output di `node_modules/.prisma` | Client output di `src/generated/prisma` |

**Kenapa Prisma butuh adapter sekarang?**
Prisma 7 memisahkan "query engine" dari "database driver". Adapter adalah jembatan antara Prisma Client dan database spesifik (SQLite, PostgreSQL, MySQL). Ini membuat Prisma lebih modular — misalnya, kita bisa pakai Prisma tanpa Node.js native binary (penting untuk Edge runtime seperti Cloudflare Workers).

**Yang kami pakai**: `@prisma/adapter-libsql` + `@libsql/client` untuk SQLite. libSQL adalah fork SQLite yang mendukung remote connection (seperti Turso), tapi juga bisa dipakai untuk local file SQLite.

### 2.4 NextAuth v5 (Auth.js) — Otentikasi Modern

NextAuth v5 (dipanggil "Auth.js") adalah rewrite besar dari v4:

| NextAuth v4 | NextAuth v5 (beta) |
|-------------|---------------------|
| `NextAuth()` di satu file | `NextAuth()` mengembalikan `{ handlers, auth, signIn, signOut }` |
| Route handler manual | `handlers.GET`, `handlers.POST` — tinggal export |
| `getServerSession()` | `auth()` — lebih simpel |
| TypeScript types global | Augmentasi module declaration |

**Yang kami setup:**
- Credentials provider (email + password dengan bcrypt)
- JWT strategy (session disimpan di cookie, bukan di database)
- Callback untuk menambahkan `role` ke session token
- TypeScript module augmentation (`src/types/next-auth.d.ts`) agar `session.user.role` dikenali

### 2.5 shadcn/ui dengan Base UI — Perubahan Besar

Ini perubahan yang TIDAK TERDUGA dan paling berdampak. shadcn/ui versi terbaru (v4) menggunakan **Base UI** (`@base-ui/react`) sebagai library primitif, BUKAN Radix UI (`@radix-ui/react`).

**Akibatnya:**
- Tidak ada lagi `asChild` prop di komponen seperti `Button`, `DropdownMenuItem`, dll.
- Solusi: Gunakan `Link` langsung dengan `buttonVariants()` untuk navigasi, atau komponen `DropdownMenuItem` langsung tanpa `asChild`.

**Kenapa Base UI?**
- Dibuat oleh tim yang sama dengan Radix UI (tim dari WorkOS yang juga membuat Radix)
- Lebih ringan dan modern
- Menggunakan native ARIA attributes lebih baik
- Tapi... dokumentasi dan ekosistem masih catching up

### 2.6 Route Group di Next.js — Organisasi Halaman

Next.js App Router punya fitur **Route Group** yang ditandai dengan tanda kurung `(nama)`:

```
app/
├── (auth)/        ← Route Group: tidak mempengaruhi URL
│   ├── login/     ← URL: /login
│   └── register/  ← URL: /register
├── (main)/        ← Route Group: tidak mempengaruhi URL
│   ├── library/   ← URL: /library
│   └── upload/    ← URL: /upload
└── admin/         ← URL: /admin (bisa juga di-group)
```

**Kenapa pakai Route Group?**
- Setiap group bisa punya `layout.tsx` sendiri
- `(auth)` — layout tanpa navbar, form di tengah layar
- `(main)` — layout dengan navbar + container
- `admin/` — layout dengan pengecekan role ADMIN

File `layout.tsx` dalam group akan **membungkus** semua halaman di dalam group tersebut. Ini seperti template yang dipakai bersama.

### 2.7 Client vs Server Component — Batas yang Penting

Next.js App Router punya dua jenis komponen:

**Server Component (default):**
- Tidak pakai `"use client"` di atas
- Bisa langsung query database (pakai Prisma)
- Tidak bisa pakai `useState`, `useEffect`, `onClick`
- Render di server, hasilnya dikirim sebagai HTML

**Client Component:**
- Ada `"use client"` di baris pertama
- Bisa interaktif (event handler, state, effect)
- Tidak bisa langsung query database
- Harus fetch data lewat API route atau Server Action

**Aturan praktis di project ini:**
- Page = Server Component
- Komponen interaktif (Navbar, Form, PDF Reader) = Client Component
- Library utilitas (prisma.ts, auth.ts) = hanya dipakai di server

### 2.8 Obrolan Singkat: Kenapa SQLite dulu?

Untuk development, kita pakai SQLite. **Kenapa bukan PostgreSQL langsung?**

1. **Zero setup** — Tidak perlu install database server, tidak perlu Docker
2. **File-based** — Database adalah satu file `dev.db`, mudah dihapus/reset
3. **Gratis** — Tidak perlu Supabase DB (ada limit free tier)
4. **Identik dengan Prisma** — Prisma schema kita bisa langsung di-switch ke PostgreSQL nanti, hanya ganti provider + connection string

Nanti kalau mau deploy ke production (Vercel + Supabase), tinggal:
1. Ganti `provider = "sqlite"` ke `provider = "postgresql"` di schema.prisma
2. Ganti DATABASE_URL ke Supabase PostgreSQL connection string
3. Ganti adapter dari `PrismaLibSql` ke `PrismaPg` (atau tanpa adapter khusus untuk Postgres)

---

---

## Insight #3 — Fase 2: Auth System (Register + Login)

**Tanggal**: Implementasi auth  
**Konteks**: Membuat form register/login dengan react-hook-form + Zod + NextAuth.

### 3.1 Zod — Schema-First Validation

Zod adalah library validasi TypeScript-first. Cara kerjanya: kita **mendefinisikan schema dulu**, lalu Zod memvalidasi data terhadap schema itu.

```typescript
// 1. Definisikan schema
const registerSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
})

// 2. Validasi data
const result = registerSchema.safeParse({ email: "xxx", password: "123" })
if (!result.success) {
  // result.error.issues = [{ message: "Format email tidak valid" }, { message: "Password minimal 8 karakter" }]
}

// 3. Kalau sukses, data sudah typed!
const { email, password } = result.data // email: string, password: string
```

**Kenapa Zod, bukan validasi manual?**
- **Single source of truth** — Schema yang sama dipakai di client (react-hook-form) DAN server (API route). Kalau nambah field, update di satu tempat.
- **Type inference** — `type RegisterInput = z.infer<typeof registerSchema>` otomatis menghasilkan tipe TypeScript
- **Composable** — Bisa `.refine()` untuk validasi kompleks (contoh: konfirmasi password harus cocok)

**Yang kami alami**: Zod 4 punya breaking change — `error.errors` berubah jadi `error.issues`. Ini contoh kenapa penting cek versi library.

### 3.2 bcryptjs — Hashing, BUKAN Encryption

Ini konsep yang sering disalahpahami:

| | Hashing (bcrypt) | Encryption |
|---|---|---|
| **Bisa dibalik?** | Tidak | Ya (dengan key) |
| **Cocok untuk** | Password | Data sensitif yang perlu dibaca ulang |
| **Contoh** | `$2a$12$xxxx...` | `aes-256-gcm` |

**Kenapa password di-hash, bukan di-encrypt?**
- Kalau database bocor, attacker tidak bisa membaca password asli
- bcrypt otomatis menambahkan **salt** (string acak) ke setiap hash, jadi dua user dengan password sama akan punya hash berbeda
- bcrypt sengaja **lambat** — ini fitur, bukan bug. Memperlambat brute-force attack.

```typescript
const hash = await bcrypt.hash("password123", 12)
// $2a$12$LJ3m4ys3GZ... (butuh ~250ms untuk compute)

const match = await bcrypt.compare("password123", hash)
// true (butuh ~250ms juga)
```

Angka `12` adalah **salt rounds** — semakin besar, semakin lambat (dan aman), tapi makin berat di server.

### 3.3 react-hook-form + zodResolver — Form yang Performant

react-hook-form (RHF) berbeda dari controlled form biasa. **RHF menggunakan uncontrolled inputs** (nilai disimpan di DOM, bukan di React state).

```
Controlled form (useState):
  Setiap ketik → re-render seluruh form → lambat

react-hook-form:
  Setiap ketik → hanya update internal ref → re-render minimal → cepat
```

`zodResolver` adalah jembatan antara Zod schema dan RHF. Saat user submit:
1. RHF mengumpulkan semua nilai field
2. zodResolver menjalankan Zod schema validation
3. Error dari Zod otomatis dipetakan ke field yang sesuai

Pattern yang dipakai:
```tsx
const form = useForm<RegisterInput>({
  resolver: zodResolver(registerSchema),
})

<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />  {/* Otomatis tampil error dari Zod */}
    </FormItem>
  )}
/>
```

### 3.4 NextAuth Flow — Dari Login ke Session

Ini diagram sederhana dari apa yang terjadi saat user login:

```
User                Browser                Server                Database
 │                     │                     │                     │
 │  Isi form login     │                     │                     │
 │────────────────────>│                     │                     │
 │                     │  signIn("credentials", {...})             │
 │                     │────────────────────>│                     │
 │                     │                     │  Cari user by email │
 │                     │                     │───────────────────>│
 │                     │                     │  <─── user data ─── │
 │                     │                     │                     │
 │                     │                     │  bcrypt.compare()   │
 │                     │                     │  password vs hash   │
 │                     │                     │                     │
 │                     │  <── session cookie │                     │
 │                     │                     │                     │
 │  Redirect /library   │                     │                     │
 │<────────────────────│                     │                     │
```

Session disimpan di **httpOnly cookie** di browser (tidak bisa diakses JavaScript — aman dari XSS). Di server, session dikelola oleh JWT.

### 3.5 JWT Strategy vs Database Strategy

NextAuth support dua strategi:

| | JWT | Database |
|---|---|---|
| **Simpan session di** | Encrypted cookie (JWT token) | Tabel `Session` di database |
| **Query database tiap request?** | Tidak | Ya |
| **Cocok untuk** | App sederhana, tanpa database | App yang perlu revoke session |
| **Yang kami pakai** | ✓ | |

Kita pakai JWT karena:
- Tidak perlu query database setiap request (lebih cepat)
- Session ID dan role disimpan di dalam token
- Untuk revoke (misalnya banned user), cukup hapus token atau invalidate di level database

### 3.6 Mengapa API Route, Bukan Server Action?

Di Next.js 16, ada dua cara melakukan mutasi data dari client ke server:

**Server Action** (baru, direkomendasikan Next.js):
```typescript
// Bisa dipanggil langsung dari Client Component
async function registerUser(formData: FormData) {
  "use server"
  // ...
}
```

**API Route** (cara klasik):
```typescript
// POST /api/register
export async function POST(request: Request) { ... }
```

Kita pakai API Route untuk register karena lebih eksplisit dan terpisah (separation of concerns). Server Action lebih cocok untuk RSC (React Server Components) yang masih kontroversial di komunitas.

### 3.7 Suspense — Kenapa Dibutuhkan di Login Page?

Login page kita dibungkus `<Suspense>` karena menggunakan `useSearchParams()` — hook yang membaca query string (`?registered=true`).

```
Rules of Next.js 16:
  Komponen yang memakai useSearchParams() HARUS dibungkus Suspense boundary.
  Kalau tidak, build akan GAGAL (bukan warning).
```

Kenapa? Karena `useSearchParams()` membuat komponen "dynamic" (tidak bisa di-pre-render secara statis). Suspense memberi tahu Next.js: "render dulu shell-nya, data searchParams nyusul."

---

*Insight berikutnya akan ditambahkan saat kita bangun Library Page — katalog ebook.*

---

## Insight #4 — Fase 3: Library Page & Font Poppins

**Tanggal**: Implementasi library  
**Konteks**: Ganti font ke Poppins + halaman katalog ebook dengan search + empty state.

### 4.1 Next.js Font Optimization — Bukan Sekadar Import

Next.js punya sistem font bawaan via `next/font/google` yang melakukan hal-hal di bawah hood:

1. **Self-hosting otomatis** — Font di-download saat build dan disimpan di server sendiri. Tidak ada request ke Google Fonts. Ini menghilangkan dependency eksternal dan meningkatkan privasi.

2. **Subsetting** — Hanya karakter yang digunakan yang dikirim. Untuk Poppins dengan subset `latin`, file yang dikirim hanya berisi karakter A-Z, a-z, 0-9, dan tanda baca latin. Tidak ada karakter Cyrillic, Arab, dll. Ini mengurangi ukuran file font dari ~200KB ke ~20KB.

3. **Zero layout shift** — CSS `font-display: swap` dikombinasikan dengan preload, sehingga teks langsung muncul dengan font yang benar tanpa "flash of unstyled text" (FOUT).

4. **CSS Variable** — Font didaftarkan sebagai CSS variable (`--font-sans`, `--font-mono`) yang kemudian dipakai oleh Tailwind.

```typescript
const poppins = Poppins({
  variable: "--font-sans",      // Nama CSS variable
  subsets: ["latin"],            // Hanya karakter latin
  weight: ["400", "500", "600", "700"],  // Berat yang dibutuhkan
})
```

**Kenapa Poppins?** Untuk aplikasi membaca (reading app), font sans-serif geometris seperti Poppins memberikan kesan modern, bersih, dan mudah dibaca di layar. Punya 4 weight yang kita pakai untuk berbagai tingkat emphasis.

### 4.2 Server Component + searchParams — Pola Modern Next.js

Di Next.js 16, `searchParams` di server component berubah jadi **Promise** (bukan object langsung). Ini bagian dari persiapan Next.js menuju arsitektur yang lebih async-friendly.

```typescript
// Next.js 16 — searchParams adalah Promise!
export default async function LibraryPage({
  searchParams,  // Promise<{ search?: string }>
}: LibraryPageProps) {
  const { search } = await searchParams  // Harus di-await
  // ...
}
```

**Kenapa ini bagus?** Server component bisa langsung query database berdasarkan search params tanpa perlu API route tambahan. Data fetching dan rendering terjadi di server, hasilnya HTML murni dikirim ke client.

### 4.3 Debounce Search — Kenapa 300ms?

Search bar kita menggunakan `useDebouncedCallback` dengan delay 300ms:

```typescript
const handleSearch = useDebouncedCallback((term: string) => {
  router.push(`/library?${params.toString()}`)
}, 300)
```

**Tanpa debounce**: Setiap ketik huruf → update URL → server render ulang → 26 request untuk kata "javascript". Boros.

**Dengan debounce 300ms**: User berhenti mengetik → tunggu 300ms → 1 request. Efisien.

**Kenapa 300ms?** Psikologi UX: rata-rata jeda antar ketikan adalah 200-400ms. 300ms adalah sweet spot — cukup cepat terasa responsif, cukup lambat untuk mengurangi request.

### 4.4 Loading Skeleton — Persepsi Performa

`loading.tsx` di folder route otomatis dipakai Next.js sebagai fallback selama page di-render (streaming). Ini bagian dari **React Suspense** di level route.

```
User buka /library
  → Next.js langsung kirim loading.tsx (HTML skeleton)
  → Server query database (butuh ~50ms)
  → Next.js stream hasil query ke client
  → Client ganti skeleton dengan konten asli
```

**Kenapa skeleton, bukan spinner?** Skeleton memberikan persepsi lebih cepat karena user melihat "bentuk" konten sebelum kontennya muncul. Spinner memberikan kesan "menunggu" (pasif).

### 4.5 Dynamic vs Static Route

Dari output build:
```
ƒ /library      → Dynamic (server-rendered on demand)
○ /login        → Static (prerendered as static content)
```

Library dynamic karena membaca database (`prisma.book.findMany`). Next.js mendeteksi ini dan menandai route sebagai dynamic. Login/register static karena tidak ada data fetching di server component.

---

*Insight berikutnya akan ditambahkan saat kita bangun Book Detail Page.*

---

## Insight #5 — Debugging Style Hilang di Tailwind v4 + Turbopack

**Tanggal**: Debugging  
**Konteks**: Semua styling shadcn/ui hilang. Halaman putih polos seperti tidak ada CSS.

### 5.1 Akar Masalah: `"style"` Export Condition

Semua CSS hilang karena Turbopack **tidak bisa me-resolve** `@import` yang menggunakan `"style"` condition di package.json exports.

`globals.css` kita tadinya:
```css
@import "tailwindcss";          /* ✅ Okay — Tailwind v4 entry */
@import "tw-animate-css";       /* ❌ Tidak resolve */
@import "shadcn/tailwind.css";  /* ❌ Tidak resolve */
```

Package.json dari kedua package:
```json
// shadcn/package.json
"./tailwind.css": {
  "style": "./dist/tailwind.css"    // ← Turbopack tidak support "style"
}

// tw-animate-css/package.json
".": {
  "style": "./dist/tw-animate.css"  // ← Sama
}
```

### 5.2 Kenapa `"style"` Condition Tidak Didukung?

Ekspor pakai `"style"` condition adalah cara library memberi tahu bundler: "ini file CSS utama saya." Dulu di Webpack (via css-loader), ini jalan. Tapi:

**Turbopack belum sepenuhnya support semua Node.js package.json export conditions.** Salah satunya adalah `"style"`.

### 5.3 Solusi: Copy CSS ke Project

Kita copy kedua file CSS ke `src/styles/` dan import dengan relative path:

```css
@import "tailwindcss";
@import "../../styles/tw-animate.css";   /* ✅ Relative path */
@import "../../styles/shadcn.css";       /* ✅ Relative path */
```

### 5.4 Pelajaran

1. **Ketika styling hilang total di Next.js 16 + Turbopack**, cek import CSS di `globals.css`. Import yang fail **diam-diam** (tidak ada error, tapi CSS tidak dimuat).

2. **Dependency dengan `"style"` export condition** butuh penanganan khusus di Turbopack. Solusi termudah: copy CSS-nya ke project sendiri.

3. **Rule of thumb**: Selalu verifikasi dengan `pnpm build` setelah install package baru yang menyediakan CSS.

---

## Insight #6 — Fase 4: Upload Ebook & File Serving

**Tanggal**: Implementasi upload  
**Konteks**: Upload PDF + cover, simpan ke lokal, tampil di My Uploads.

### 6.1 FormData & Multipart — Cara Kerja Upload File

Ketika browser mengirim file, ia tidak bisa mengirimnya sebagai JSON biasa. Browser menggunakan **multipart/form-data** — format yang bisa mencampur teks dan binary dalam satu request.

```
POST /api/upload
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="title"

Judul Buku
------WebKitFormBoundary
Content-Disposition: form-data; name="pdf"; filename="buku.pdf"
Content-Type: application/pdf

<binary PDF content>
------WebKitFormBoundary--
```

Di Next.js, `request.formData()` otomatis mem-parse format ini menjadi object `FormData`.

### 6.2 Kenapa Storage Lokal Dulu?

Kelemahan: di Vercel filesystem ephemeral, tidak scalable. Kelebihan: zero setup, cepat, gratis tanpa batas.

Migrasi ke Supabase nanti tinggal ganti `writeFile()` → `supabase.storage.upload()` dan update `fileUrl`.

### 6.3 Path Traversal Attack & Sanitization

Route `/api/files/[...path]` rentan path traversal:
```
GET /api/files/../../../etc/passwd  ← ATTACKER!
```

Fix: validasi bahwa hasil `path.resolve()` tetap di dalam folder `uploads/`:
```typescript
if (!filePath.startsWith(baseUploadDir)) return Forbidden
```

### 6.4 Buffer vs Stream

Buffer (pakai sekarang): baca seluruh file ke memori, simpel, cocok untuk file < 50MB.
Stream (nanti): baca sedikit demi sedikit, rendah memory, cocok untuk file besar.

### 6.5 Random ID untuk Nama File

Kenapa bukan nama asli? Hindari konflik, injection, dan menjaga privasi. File disimpan sebagai `a3f2c8d1.pdf`.

### 6.6 Auth Manual di API Route

Pakai `auth()` langsung di route handler, bukan middleware. Lebih granular dan eksplisit. Middleware bisa ditambahkan nanti untuk blanket protection.

---

## Insight #7 — Design System: Neo Brutalism, Landing Page & UX

**Tanggal**: Refactor desain  
**Konteks**: Migrasi dari shadcn default ke Neo Brutalism, redesign landing page, about, contact, navbar.

### 7.1 Neo Brutalism — Filosofi Desain

Neo Brutalism adalah gerakan desain web yang menolak "flat design" dan "glassmorphism". Prinsipnya:

| Prinsip | Implementasi |
|---------|-------------|
| **Bold borders** | `border-2 border-border` (2-3px solid black) |
| **Solid shadows** | `shadow-[4px_4px_0px_0px_#000]` (no blur, offset) |
| **High contrast** | Hitam (#000) vs putih (#FFF) + satu warna aksen bold |
| **Sharp corners** | `rounded-md` (tidak terlalu rounded) |
| **Brutal typography** | Font bold, ukuran besar, tidak ada light weight |

**Kenapa ini efektif untuk app membaca?** Kontras tinggi = mudah dibaca. Border jelas = hierarki visual kuat. Kesan "mentah" = terasa jujur, cocok untuk platform komunitas.

### 7.2 CSS Variables sebagai Design Token

Kita tidak menulis warna hardcode di komponen. Semua warna lewat CSS variables:

```css
/* globals.css */
:root {
  --primary: #4361ee;        /* Biru — pakai di semua komponen */
  --border: #000000;          /* Hitam — border tebal di mana-mana */
  --radius: 0.25rem;         /* Sedikit rounded */
}
```

```tsx
// Komponen tinggal referensi token
<button className="bg-primary border-2 border-border rounded-md">
```

**Kenapa ini powerful?**
- Ganti tema (biru → hijau) = ubah 1 variabel, seluruh app berubah
- Dark mode = override variabel yang sama di `.dark`
- Konsistensi otomatis — tidak mungkin ada komponen yang "beda warna sendiri"

### 7.3 Animasi CSS via `@utility` di Tailwind v4

Tailwind v4 memperkenalkan `@utility` — cara mendefinisikan utility class custom tanpa plugin:

```css
/* Definisikan keyframe */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Daftarkan sebagai utility */
@utility animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
```

```tsx
<div className="animate-fade-in">...</div>
```

**Kenapa bukan `@layer utilities`?** Tailwind v4 mengganti `@layer` dengan `@utility`. Perbedaannya: `@utility` bisa punya variants (`hover:animate-fade-in`, `md:animate-fade-in`), sedangkan `@layer utilities` tidak.

### 7.4 Marquee / Infinite Scroll dengan CSS

Marquee (teks berjalan) dibuat murni dengan CSS animation, tanpa JavaScript:

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-100%); }
}
```

```tsx
<div className="flex overflow-hidden">
  <div className="animate-marquee flex gap-8">
    {/* Items */}
  </div>
  <div className="animate-marquee flex gap-8" aria-hidden>
    {/* Duplicate items — untuk seamless loop */}
  </div>
</div>
```

**Kenapa butuh duplikat?** Ketika animasi mencapai akhir (-100%), elemen pertama sudah keluar layar. Duplikat memastikan tidak ada "lubang" kosong sebelum loop dimulai lagi.

**Mask gradient** (`[mask-image:linear-gradient(...)]`) di parent membuat tepi kiri/kanan fade out — kesan profesional.

### 7.5 Grid Lines Background — CSS Tanpa Asset

Background grid line dibuat tanpa image file:

```css
background-image:
  linear-gradient(#000 1px, transparent 1px),
  linear-gradient(90deg, #000 1px, transparent 1px);
background-size: 80px 80px;
```

**Cara kerja**: Dua `linear-gradient` — satu horizontal, satu vertikal. Masing-masing menggambar garis 1px hitam, lalu transparan sampai 80px. Hasilnya: grid 80x80 pixel dengan opacity rendah (0.04).

### 7.6 Active Nav Link dengan `usePathname`

Deteksi halaman aktif di navbar:

```typescript
const pathname = usePathname()  // "/library", "/about", etc.

const isActive = (href: string) =>
  pathname === href || pathname.startsWith(href + "/")
  // "/book/abc" → true untuk href="/book" (sub-path match)
```

**Kenapa `startsWith(href + "/")`?** Supaya `/book/abc` tetap menandai `/book` sebagai aktif. Tanpa ini, hanya exact match yang ter-highlight.

### 7.7 Responsive Navbar: Hamburger Pattern

Mobile hamburger tanpa library:

```
Desktop (>640px):      sm:flex — nav links horizontal
Mobile  (<640px):      sm:hidden — hamburger icon + slide-down menu
```

Pattern:
1. State `mobileOpen` (boolean)
2. Tombol hamburger toggle state
3. Menu mobile di-render kondisional (`{mobileOpen && <div>...}`)
4. Link di menu mobile auto-close (`onClick={() => setMobileOpen(false)}`)

**Tanpa Sheet/Drawer component** — kita tidak pakai Dialog karena hamburger menu sederhana lebih cepat dan natural di mobile.

### 7.8 Halaman Statis = Build-time Render

Halaman seperti `/about` dan `/contact` yang tidak baca database:

```
○ /about    → Static (pre-rendered saat build — HTML siap kirim)
ƒ /library  → Dynamic (render on demand — baca database)
```

**Keuntungan static**: Tidak ada database query, tidak ada server render. HTML sudah jadi — dikirim instant. Cocok untuk halaman informasi yang kontennya jarang berubah.

### 7.9 Lucide React — Tidak Ada Brand Icons

**Yang kami pelajari**: lucide-react adalah icon library yang fokus pada UI icons (button, navigation, form, dll). Mereka TIDAK menyediakan brand/social media icons (Facebook, Instagram, GitHub, Twitter, dll.).

**Solusi**:
- Gunakan generic icon yang visually representative: `Code2` untuk GitHub, `Camera` untuk Instagram, `MessageCircle` untuk Facebook
- Atau: inline SVG untuk brand icons spesifik

---

## Insight #8 — File Preview & UX Architecture

**Tanggal**: Refactor upload & navigasi  
**Konteks**: Tambah preview gambar + PDF sebelum upload, pindahkan Upload ke dalam Library.

### 8.1 URL.createObjectURL — Preview Tanpa Upload

Untuk menampilkan preview file sebelum diupload ke server, kita tidak perlu mengirim file dulu. Browser punya API `URL.createObjectURL()`:

```typescript
const file = e.target.files?.[0]  // File dari <input type="file">
const previewUrl = URL.createObjectURL(file)
// previewUrl = "blob:http://localhost:3000/abc-123-def"
```

**Cara kerja**: Browser membuat URL sementara (`blob:`) yang menunjuk ke file di memory. URL ini bisa dipakai di `<img src={previewUrl} />`, `<iframe src={previewUrl} />`, atau elemen apa pun yang menerima URL.

**PENTING**: `URL.revokeObjectURL()` — setiap blob URL harus di-revoke saat tidak dipakai lagi, untuk membebaskan memory:

```typescript
// Saat file baru dipilih
if (oldPreviewUrl) URL.revokeObjectURL(oldPreviewUrl)  // Bebaskan yang lama
const newPreviewUrl = URL.createObjectURL(newFile)      // Buat yang baru
```

**Kenapa tidak pakai FileReader?** `FileReader.readAsDataURL()` mengkonversi file ke base64 string. Ini boros: file 10MB jadi ~13MB base64. `URL.createObjectURL()` jauh lebih ringan — hanya membuat pointer ke file yang sudah ada di memory.

### 8.2 PDF Preview di Browser — iframe Embed

Browser modern (Chrome, Edge, Firefox) punya built-in PDF viewer. Kita bisa memanfaatkannya dengan `<iframe>`:

```tsx
<iframe
  src={URL.createObjectURL(pdfFile)}
  className="h-40 w-full"
  title="PDF Preview"
/>
```

Browser akan merender halaman pertama PDF secara native — tanpa perlu pdfjs-dist di client. Ini cukup untuk preview sebelum upload.

**Batasan**: Tidak bisa kontrol zoom, navigasi halaman, atau styling. Untuk full reader, tetap pakai pdfjs-dist (seperti di `/book/[id]/read`).

### 8.3 UX Decision: Upload Masuk Library, Bukan Navbar

**Sebelum**: Upload adalah link mandiri di navbar (`Perpustakaan | Upload | Tentang | Kontak`).

**Sesudah**: Upload adalah tombol di dalam halaman Library. Navbar hanya: `Perpustakaan | Tentang | Kontak`.

**Kenapa?** Ini adalah keputusan **Information Architecture (IA)**:

| Pattern | Cocok untuk |
|---------|------------|
| Upload di Navbar | Upload adalah fitur utama yang sering dipakai (seperti "New Post" di Twitter) |
| Upload di dalam Library | Upload adalah aksi yang berkaitan dengan Library (konteks: "tambah buku ke perpustakaan") |

Dalam Dunia Baca, Upload adalah aksi yang **konteksnya ada di Library**. User datang ke Library → melihat koleksi → ingin menambah → klik Upload. Tidak masuk akal kalau Upload setara dengan halaman Tentang atau Kontak.

### 8.4 Cleanup Effect di React — Revoke Object URL

Saat komponen form upload di-unmount (user pindah halaman), blob URL yang tidak direvoke akan tetap ada di memory sampai tab ditutup. Cleanup bisa dilakukan dengan `useEffect`:

```tsx
useEffect(() => {
  return () => {
    // Cleanup saat unmount
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
  }
}, [coverPreview, pdfPreviewUrl])
```

Ini belum kita implementasikan di upload form (akan bocor memory kecil), tapi patut dicatat sebagai best practice untuk production.

---

## Insight #9 — Supabase + Prisma 7 + Vercel: Pelajaran Koneksi Database

**Tanggal**: Deploy production  
**Konteks**: Deploy ke Vercel, database tidak reachable berkali-kali.

### 9.1 Akar Masalah: Transaction Mode vs Session Mode Pooling

Supabase menyediakan 2 mode koneksi pooler:

| Mode | Port | Parameter | Cocok untuk |
|------|------|-----------|-------------|
| **Transaction** | 6543 | `?pgbouncer=true` | Serverless function sederhana (single query per transaction) |
| **Session** | 5432 | (tanpa parameter) | Aplikasi yang butuh session persistent (Prisma) |

**KESALAHAN**: Saya pakai port 6543 (`pgbouncer=true`) dengan `PrismaPg`. Ini TIDAK KOMPATIBEL karena:
- Transaction mode menolak **prepared statements**
- Prisma sangat bergantung pada prepared statements
- PrismaPg (pg driver) butuh session mode

**SOLUSI YANG BENAR**: Pakai session mode pooler port **5432** TANPA parameter `pgbouncer=true`.

### 9.2 Kenapa Direct Host (`db.xxx.supabase.co`) Tidak Ada?

Free tier Supabase **tidak selalu mengekspos direct connection**. DNS lookup untuk `db.wlnrwuqshekrvjxpkpgz.supabase.co` return "No answer" — hostname tidak ada.

Solusi: selalu pakai pooler host (`aws-1-ap-southeast-1.pooler.supabase.co`), pilih port yang sesuai (5432 untuk session, 6543 untuk transaction).

### 9.3 Rule of Thumb Koneksi Supabase + Prisma

```
✅ BENAR:  pooler.supabase.co:5432 (session mode, TANPA pgbouncer=true)
✅ BENAR:  pooler.supabase.co:5432 (session mode, untuk PrismaPg)
❌ SALAH:  pooler.supabase.co:6543?pgbouncer=true (transaction mode, PrismaPg tidak kompatibel)
❌ SALAH:  db.xxx.supabase.co (tidak selalu ada di free tier)
```

### 9.4 Jangan Tebak Format Connection String

Supabase dashboard memberikan connection string yang persis. **Jangan dimodifikasi**. Copy dari:
- **Settings → Database → Connection string → URI** (port 5432)
- Atau **Connect → ORM → Prisma**

Kalau dari situ formatnya beda, **IKUTI PERSIS**.

### 9.5 Postinstall di Vercel

Vercel tidak auto-run `prisma generate`. Harus ditambah di `package.json`:
```json
"postinstall": "npx prisma generate"
```
Ini memastikan Prisma client di-generate setiap kali dependencies di-install di Vercel.

---

*Insight berikutnya akan ditambahkan saat kita membangun fitur berikutnya.*
