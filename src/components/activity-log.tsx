"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createActivity, deleteActivity } from "@/lib/actions/activities"
import { MessageSquare, Phone, Mail, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  type: string
  body: string | null
  created_at: string
}

const TYPE_ICON = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
}

const TYPE_LABEL = {
  note: "Note",
  call: "Call",
  email: "Email",
}

export default function ActivityLog({
  contactId,
  activities,
}: {
  contactId: string
  activities: Activity[]
}) {
  const router = useRouter()
  const [type, setType] = useState("note")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)

    const formData = new FormData()
    formData.set("type", type)
    formData.set("body", body)

    await createActivity(contactId, formData)
    setBody("")
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    await deleteActivity(id, contactId)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Add activity form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="note">Note</SelectItem>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Add a note, log a call or email…"
            rows={2}
            className="flex-1 resize-none"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={loading || !body.trim()}>
            {loading ? "Saving…" : "Log activity"}
          </Button>
        </div>
      </form>

      {/* Timeline */}
      <div className="space-y-3">
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No activity yet. Log a call, email, or note above.
          </p>
        )}
        {activities.map(activity => {
          const Icon = TYPE_ICON[activity.type as keyof typeof TYPE_ICON] ?? MessageSquare
          return (
            <div key={activity.id} className="flex gap-3 group">
              <div className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                activity.type === "call" && "bg-blue-100 text-blue-600",
                activity.type === "email" && "bg-purple-100 text-purple-600",
                activity.type === "note" && "bg-muted text-muted-foreground",
              )}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">{TYPE_LABEL[activity.type as keyof typeof TYPE_LABEL]}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{activity.body}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
