# Dunia Baca — Spesifikasi Produk

> **Singkat**: Platform berbagi ebook berbasis web (PWA). User dapat mengupload PDF ebook, membaca ebook dari user lain, dan melanjutkan bacaan dari halaman terakhir.

---

## 1. Visi & Tujuan

**Visi**: Menjadi ruang berbagi literasi digital yang sederhana dan terbuka, tempat siapa pun bisa menyimpan ebook miliknya dan membaca ebook dari orang lain.

**Tujuan spesifik**:
- Memudahkan user menyimpan dan mengelola koleksi ebook PDF pribadi
- Memungkinkan user berbagi ebook agar bisa dibaca oleh komunitas
- Memberikan pengalaman membaca yang nyaman dengan progress tracking otomatis
- Dapat diakses lintas perangkat melalui PWA

---

## 2. Persona Pengguna

| Persona | Deskripsi |
|---------|-----------|
| **Pembaca** | User biasa yang ingin menemukan dan membaca ebook gratis. Tidak selalu upload. |
| **Pengunggah** | User yang punya koleksi ebook dan ingin berbagi ke komunitas. |
| **Admin** | Mengelola konten: approve/reject ebook baru, hapus konten tidak pantas. |

---

## 3. User Stories & Acceptance Criteria

### 3.1 Otentikasi

#### US-01: Registrasi Akun
> Sebagai pengunjung, saya ingin mendaftar akun agar bisa mengakses semua fitur.

**Acceptance Criteria**:
- [ ] Halaman register berisi form: nama, email, password, konfirmasi password
- [ ] Validasi client-side: email valid, password minimal 8 karakter, password dan konfirmasi cocok
- [ ] Validasi server-side: email belum terdaftar
- [ ] Password di-hash sebelum disimpan (bcrypt)
- [ ] Setelah sukses, redirect ke halaman login dengan pesan sukses
- [ ] Jika gagal, tampilkan pesan error yang spesifik tanpa membocorkan data

#### US-02: Login
> Sebagai user terdaftar, saya ingin login agar bisa mengakses akun saya.

**Acceptance Criteria**:
- [ ] Halaman login berisi form: email, password
- [ ] Validasi client-side: email valid, password tidak kosong
- [ ] Kredensial salah → pesan error generik "Email atau password salah"
- [ ] Login sukses → redirect ke halaman utama (library)
- [ ] Session persisten (httpOnly cookie) dengan expiry
- [ ] User tetap login saat refresh halaman

#### US-03: Logout
> Sebagai user yang sedang login, saya ingin logout untuk mengamankan akun.

**Acceptance Criteria**:
- [ ] Tombol logout tersedia di navbar
- [ ] Logout menghapus session
- [ ] Redirect ke halaman login

---

### 3.2 Upload Ebook

#### US-04: Upload Ebook Baru
> Sebagai pengunggah, saya ingin mengupload ebook PDF agar bisa dibaca oleh orang lain.

**Acceptance Criteria**:
- [ ] Halaman upload berisi form: judul (required), penulis (required), deskripsi (opsional), cover image (opsional), file PDF (required)
- [ ] File PDF divalidasi: hanya `.pdf`, maksimal 50MB
- [ ] Cover image: `.jpg/.png/.webp`, maksimal 5MB
- [ ] Jika cover tidak diupload, tampilkan placeholder otomatis
- [ ] Upload progress bar saat file sedang dikirim
- [ ] File disimpan ke Supabase Storage
- [ ] Metadata disimpan ke database
- [ ] Status awal ebook: `PENDING` (menunggu approval admin)
- [ ] User mendapat notifikasi bahwa ebook menunggu review
- [ ] Jika gagal upload, tampilkan error dan form tetap terisi (kecuali file)

#### US-05: Melihat Daftar Ebook Saya
> Sebagai pengunggah, saya ingin melihat daftar ebook yang pernah saya upload.

**Acceptance Criteria**:
- [ ] Halaman "My Uploads" hanya menampilkan ebook milik user yang login
- [ ] Setiap item menampilkan: cover, judul, penulis, status (PENDING/APPROVED/REJECTED), tanggal upload
- [ ] Filter berdasarkan status
- [ ] Jika belum ada upload, tampilkan empty state dengan CTA ke halaman upload

---

### 3.3 Library & Browsing

#### US-06: Melihat Katalog Ebook
> Sebagai pembaca, saya ingin menjelajahi ebook yang tersedia agar bisa menemukan bacaan baru.

**Acceptance Criteria**:
- [ ] Halaman utama menampilkan grid ebook dengan status APPROVED
- [ ] Setiap kartu ebook: cover, judul, penulis, jumlah pembaca
- [ ] Urutan default: terbaru
- [ ] Lazy loading / pagination (load 12 item per halaman)
- [ ] Search bar untuk mencari berdasarkan judul atau penulis
- [ ] Filter berdasarkan abjad
- [ ] Empty state jika tidak ada ebook

#### US-07: Melihat Detail Ebook
> Sebagai pembaca, saya ingin melihat detail ebook sebelum memutuskan membaca.

**Acceptance Criteria**:
- [ ] Halaman detail menampilkan: cover besar, judul, penulis, deskripsi, jumlah pembaca, tanggal upload
- [ ] Tombol "Baca Sekarang" (mengarah ke PDF reader)
- [ ] Jika user sedang login, tampilkan progress bacaan (contoh: "Halaman 42 dari 200")
- [ ] Tombol "Lanjutkan Baca" jika ada progress sebelumnya

---

### 3.4 PDF Reader & Progress

#### US-08: Membaca PDF
> Sebagai pembaca, saya ingin membaca ebook langsung di browser dengan nyaman.

**Acceptance Criteria**:
- [ ] PDF dirender per halaman di dalam browser menggunakan pdfjs-dist
- [ ] Navigasi: tombol previous/next halaman, input nomor halaman langsung
- [ ] Informasi halaman saat ini (contoh: "Halaman 5 / 200")
- [ ] Mode fullscreen
- [ ] Zoom in/out
- [ ] Tampilan mobile-friendly (single page scroll)
- [ ] Loading state saat halaman dirender

#### US-09: Progress Bacaan Otomatis
> Sebagai pembaca, saya ingin progress bacaan tersimpan otomatis agar bisa melanjutkan nanti.

**Acceptance Criteria**:
- [ ] Halaman terakhir tersimpan otomatis setiap user mengganti halaman
- [ ] Disimpan ke database (tabel `ReadingProgress`)
- [ ] Tidak mengganggu pengalaman membaca (simpan di background, debounce)
- [ ] Saat user membuka ebook yang sama lagi, otomatis lanjut dari halaman terakhir
- [ ] Jika user belum pernah baca, mulai dari halaman 1

---

### 3.5 Admin Panel

#### US-10: Dashboard Admin
> Sebagai admin, saya ingin melihat statistik platform.

**Acceptance Criteria**:
- [ ] Total user terdaftar
- [ ] Total ebook (per status)
- [ ] Total pembaca (user yang punya progress bacaan)
- [ ] Ebook terbaru menunggu review (highlight)

#### US-11: Review Ebook (Approve/Reject)
> Sebagai admin, saya ingin me-review ebook baru sebelum dipublikasikan.

**Acceptance Criteria**:
- [ ] Daftar ebook dengan status PENDING
- [ ] Admin bisa melihat detail ebook (cover, judul, penulis, deskripsi)
- [ ] Admin bisa melihat file PDF langsung dari panel
- [ ] Tombol "Approve" → status berubah jadi APPROVED, ebook muncul di library
- [ ] Tombol "Reject" → modal alasan reject (wajib), status berubah jadi REJECTED
- [ ] User yang upload mendapat notifikasi status ebooknya (bisa dilihat di My Uploads)

#### US-12: Hapus Ebook
> Sebagai admin, saya ingin menghapus ebook yang melanggar.

**Acceptance Criteria**:
- [ ] Tombol hapus dengan konfirmasi modal
- [ ] File PDF dan cover ikut terhapus dari storage
- [ ] Progress bacaan terkait ikut terhapus

---

## 4. Data Model (Prisma Schema)

```prisma
model User {
  id              String            @id @default(cuid())
  name            String
  email           String            @unique
  passwordHash    String
  role            Role              @default(USER)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  books           Book[]            // ebook yang diupload user ini
  readingProgress ReadingProgress[]
}

enum Role {
  USER
  ADMIN
}

enum BookStatus {
  PENDING
  APPROVED
  REJECTED
}

model Book {
  id            String     @id @default(cuid())
  title         String
  author        String
  description   String?    @db.Text
  coverUrl      String?    // URL ke cover image di Supabase Storage
  fileUrl       String     // URL ke file PDF di Supabase Storage
  fileSize      Int        // ukuran file dalam bytes
  pageCount     Int?       // jumlah halaman (diisi setelah PDF diproses)
  status        BookStatus @default(PENDING)
  rejectionReason String?  @db.Text
  uploaderId    String
  uploader      User       @relation(fields: [uploaderId], references: [id])
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  readingProgress ReadingProgress[]

  @@index([status])
  @@index([title, author])
}

model ReadingProgress {
  id           String   @id @default(cuid())
  userId       String
  bookId       String
  currentPage  Int      @default(1)
  totalPages   Int      // snapshot total halaman saat terakhir baca
  lastReadAt   DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  book         Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)

  @@unique([userId, bookId])
  @@index([userId])
}
```

---

## 5. Route Design (Next.js App Router)

```
/                           → Landing page / redirect ke /library
/login                      → Halaman login
/register                   → Halaman registrasi
/library                    → Katalog ebook (public + authenticated)
/library?search=...         → Search
/book/[id]                  → Halaman detail ebook
/book/[id]/read             → PDF Reader (protected)
/upload                     → Form upload ebook (protected)
/my-uploads                 → Daftar ebook milik user (protected)

/admin                      → Dashboard admin (ADMIN only)
/admin/books                → Review buku PENDING (ADMIN only)
/admin/users                → Manajemen user (ADMIN only)

/api/auth/[...nextauth]     → NextAuth API routes
/api/upload                  → Upload file handler
/api/books                   → CRUD buku
/api/books/[id]              → Detail/update/delete buku
/api/reading-progress        → Simpan/ambil progress bacaan
/api/admin/books/[id]/review → Approve/reject buku
```

---

## 6. Data Flow

### Upload Flow
```
User → Upload Form → Client validasi file → Upload file ke Supabase Storage
     → Dapatkan URL → Simpan metadata ke DB via API → Status: PENDING
     → Admin review → Approve/Reject → Status update
```

### Reading Flow
```
User buka /book/[id] → Fetch metadata + progress dari API
  → Jika ada progress → "Lanjutkan dari halaman X"
  → Klik Baca → /book/[id]/read → PDF.js render halaman ke-X
  → Setiap ganti halaman → debounce 2 detik → PATCH /api/reading-progress
```

### Auth Flow
```
Register → hash password → simpan user → redirect /login
Login → verifikasi password → NextAuth buat session → httpOnly cookie
Setiap request protected → middleware NextAuth cek session
```

---

## 7. PWA Requirements

- [ ] Manifest.json (nama app, icon, theme color, display: standalone)
- [ ] Service Worker untuk caching static assets (offline shell)
- [ ] Halaman fallback offline
- [ ] Ikon app dalam berbagai ukuran (192px, 512px)
- [ ] Splash screen

---

## 8. Non-Functional Requirements

| Aspek | Target |
|-------|--------|
| Performa | Lighthouse score > 80 |
| Ukuran file upload | Maksimal 50MB per PDF |
| Keamanan | Password hashed (bcrypt), session httpOnly, rate limiting pada API |
| Responsivitas | Mobile-first, berfungsi baik di layar 320px ke atas |
| Aksesibilitas | Semantic HTML, alt text, keyboard navigable, kontras warna cukup |
