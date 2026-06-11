import { z } from "zod"

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(50, "Nama maksimal 50 karakter"),
    email: z
      .string()
      .email("Format email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(100, "Password maksimal 100 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  })

export const loginSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

export const uploadBookSchema = z.object({
  title: z
    .string()
    .min(1, "Judul wajib diisi")
    .max(200, "Judul maksimal 200 karakter"),
  author: z
    .string()
    .min(1, "Penulis wajib diisi")
    .max(100, "Penulis maksimal 100 karakter"),
  description: z
    .string()
    .max(2000, "Deskripsi maksimal 2000 karakter")
    .optional(),
})

export type UploadBookInput = z.infer<typeof uploadBookSchema>
