# Session Summary — Lanjutkan di Cursor

## Project: Dunia Baca
Platform berbagi ebook PDF (Next.js 16 + Neo Brutalism)

## Status Terakhir (8 Juni 2026)

### Yang Sudah Jadi
- Landing page (`/`) — hero #deecff, grid lines, marquee, features, CTA
- Auth — register/login/logout (NextAuth v5, Credentials, JWT)
- Library (`/library`) — tab Umum + Koleksi Saya (via param), search debounce
- Book Detail (`/book/[id]`) — cover, metadata, tombol Baca/Lanjutkan
- PDF Reader (`/book/[id]/read`) — pdfjs-dist dynamic import, progress auto-save
- Upload (`/upload`) — form + cover preview + PDF iframe preview, langsung APPROVED
- Admin Panel (`/admin`) — dashboard stats, manage books (delete), manage users (ban/unban/delete)
- About (`/about`), FAQ (`/faq`), Contact (`/contact`) — profil Imam Suranda, Saweria, GitHub
- Neo Brutalism theme — blue #4361ee, border-2, shadow-[4px_4px_0_#000], grid background
- PWA — manifest, appleWebApp meta, favicon (circle white bg + icon hitam)
- Favicon — `duniabaca-icon.png` di-crop square + circle putih, 16/32/48/192px
- Navbar — hamburger mobile, active link indicator, no flash on refresh
- Font — Poppins + JetBrains Mono

### Belum / TODO
- PWA service worker (offline caching)
- Dark mode toggle
- 404 / error pages yang proper
- Testing
- Supabase migration (storage + DB)

### File Penting
- `spec.md` — user stories, data model, route design
- `rules.md` — coding conventions, nama file, struktur folder
- `insight.md` — pembelajaran teknis (8 insight sejauh ini)
- `prisma/schema.prisma` — User (id, name, email, passwordHash, role, status), Book, ReadingProgress

### Tech Stack
- Next.js 16 + Turbopack
- Tailwind v4 + shadcn/ui (Base UI — NO asChild!)
- Prisma 7 + SQLite (libSQL adapter)
- NextAuth v5 (beta)
- pdfjs-dist (dynamic import — no SSR)
- react-hook-form + zod v4 (`.issues` bukan `.errors`)
- lucide-react v1.17 (no brand icons: Github, Facebook, Instagram)

### Gotchas (PENTING!)
1. shadcn pakai Base UI, bukan Radix → tidak ada `asChild` prop
2. Zod v4: `error.issues` bukan `error.errors`
3. `useSearchParams()` HARUS dibungkus `<Suspense>`
4. pdfjs-dist HARUS `await import()` — tidak bisa static import (SSR error)
5. `searchParams` di Next.js 16 adalah Promise
6. React 19: `useRef()` HARUS ada initial value
7. Import CSS: `shadcn/tailwind.css` & `tw-animate-css` harus copy ke `src/styles/` (Turbopack tidak support `"style"` export condition)

### Scripts
```
pnpm dev          # dev server
pnpm build        # build + typecheck
pnpm db:studio    # Prisma Studio
pnpm db:migrate   # Prisma migrate
pnpm db:seed      # Seed admin user
```

### Akun Admin
Email: admin@duniabaca.com
Password: admin123456
