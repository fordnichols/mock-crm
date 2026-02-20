"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SPECIALTIES = [
  "Cardiothoracic Surgery",
  "Neurosurgery",
  "Orthopedic Surgery",
  "General Surgery",
  "Vascular Surgery",
  "Pediatric Surgery",
  "Trauma Surgery",
  "Spine Surgery",
  "Transplant Surgery",
  "Surgical Oncology",
  "Plastic & Reconstructive Surgery",
  "Colorectal Surgery",
  "Urological Surgery",
  "Hepatobiliary Surgery",
  "Bariatric Surgery",
  "Endocrine Surgery",
  "Thoracic Surgery",
  "Hand Surgery",
  "Robotic Surgery",
  "Laparoscopic Surgery",
  "Maxillofacial Surgery",
]

export default function SpecialtyFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get("specialty") ?? ""

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set("specialty", value)
    } else {
      params.delete("specialty")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Select value={current || "all"} onValueChange={handleChange}>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="All specialties" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All specialties</SelectItem>
        {SPECIALTIES.map(s => (
          <SelectItem key={s} value={s}>{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
