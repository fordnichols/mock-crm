"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

const OPTIONS = [
  { label: "All", value: "" },
  { label: "Candidates", value: "candidate" },
  { label: "Clients", value: "client" },
]

export default function TypeFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get("type") ?? ""

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("type", value)
    } else {
      params.delete("type")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-1 rounded-md border p-1">
      {OPTIONS.map(opt => (
        <Button
          key={opt.value}
          variant={current === opt.value ? "secondary" : "ghost"}
          size="sm"
          className={`h-7 px-3 text-xs cursor-pointer ${current === opt.value ? "bg-muted-foreground/20 hover:bg-muted-foreground/20" : ""}`}
          onClick={() => handleClick(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}
