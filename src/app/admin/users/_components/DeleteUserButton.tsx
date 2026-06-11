"use client"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"

interface Props {
  userId: string
  userName: string
  deleteUser: (formData: FormData) => Promise<void>
}

export function DeleteUserButton({ userId, userName, deleteUser }: Props) {
  return (
    <form
      action={async (formData: FormData) => {
        if (!confirm(`Hapus ${userName}? Semua data akan hilang permanen.`)) return
        await deleteUser(formData)
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className={cn(
          buttonVariants({ variant: "destructive", size: "icon-xs" }),
          "shrink-0"
        )}
        title="Hapus"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </form>
  )
}
