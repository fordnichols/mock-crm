"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateDeal, deleteDeal } from "@/lib/actions/deals"
import { Trash2 } from "lucide-react"

const STAGES = ["Lead", "Qualified", "Proposal", "Won", "Lost"] as const

interface Contact {
  id: string
  name: string
}

interface Deal {
  id: string
  title: string
  value: number | null
  stage: string
  description: string | null
  close_date: string | null
  contact_id: string | null
  contact?: { name: string } | null
  created_at: string
}

interface DealSheetProps {
  deal: Deal | null
  contacts: Contact[]
  onClose: () => void
}

export default function DealSheet({ deal, contacts, onClose }: DealSheetProps) {
  const router = useRouter()
  const [stage, setStage] = useState(deal?.stage ?? "Lead")
  const [contactId, setContactId] = useState(deal?.contact_id ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Reset controlled fields when a different deal is opened
  useEffect(() => {
    setStage(deal?.stage ?? "Lead")
    setContactId(deal?.contact_id ?? "")
    setError("")
    setLoading(false)
  }, [deal?.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!deal) return
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    formData.set("stage", stage)
    formData.set("contact_id", contactId)

    const result = await updateDeal(deal.id, formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
      onClose()
    }
  }

  async function handleDelete() {
    if (!deal) return
    await deleteDeal(deal.id)
    router.refresh()
    onClose()
  }

  return (
    <Sheet open={!!deal} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-8">
        {deal && (
          <>
            <SheetHeader className="mb-6">
              <div className="flex items-center justify-between pr-6">
                <SheetTitle className="text-lg">{deal.title}</SheetTitle>
                <Badge variant="outline">{deal.stage}</Badge>
              </div>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={deal.title} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value ($)</Label>
                  <Input id="value" name="value" type="number" min="0" defaultValue={deal.value ?? 0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="close_date">Close date</Label>
                  <Input id="close_date" name="close_date" type="date" defaultValue={deal.close_date ?? ""} />
                </div>
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
                    <SelectValue placeholder="No contact linked" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Notes</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Add notes about this deal…"
                  defaultValue={deal.description ?? ""}
                  rows={4}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete deal
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>
            </form>

            <p className="text-xs text-muted-foreground mt-6">
              Created {new Date(deal.created_at).toLocaleDateString()}
            </p>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
