"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createDeal } from "@/lib/actions/deals"

const STAGES = ["Lead", "Qualified", "Proposal", "Won", "Lost"] as const

interface Contact {
  id: string
  name: string
}

interface DealFormProps {
  contacts: Contact[]
  defaultStage?: string
  onSuccess?: () => void
}

export default function DealForm({ contacts, defaultStage = "Lead", onSuccess }: DealFormProps) {
  const router = useRouter()
  const [stage, setStage] = useState(defaultStage)
  const [contactId, setContactId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    formData.set("stage", stage)
    formData.set("contact_id", contactId)

    const result = await createDeal(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="e.g. Acme Corp — Enterprise Plan" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="value">Value ($)</Label>
        <Input id="value" name="value" type="number" min="0" placeholder="0" />
      </div>
      <div className="space-y-2">
        <Label>Stage</Label>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Contact</Label>
        <Select value={contactId} onValueChange={setContactId}>
          <SelectTrigger>
            <SelectValue placeholder="Link a contact (optional)" />
          </SelectTrigger>
          <SelectContent>
            {contacts.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving…" : "Add deal"}
      </Button>
    </form>
  )
}
