import { createClient } from "@/lib/supabase/server"
import KanbanBoard from "@/components/kanban-board"
import DealForm from "@/components/deal-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

export default async function DealsPage() {
  const supabase = await createClient()

  const [{ data: deals }, { data: contacts }] = await Promise.all([
    supabase
      .from("deals")
      .select("id, title, value, stage, position, description, close_date, contact_id, contact:contacts(name), created_at")
      .order("stage").order("position", { ascending: true }),
    supabase
      .from("contacts")
      .select("id, name")
      .order("name"),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deals</h1>
          <p className="text-muted-foreground">{deals?.length ?? 0} total</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add deal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New deal</DialogTitle>
            </DialogHeader>
            <DealForm contacts={contacts ?? []} />
          </DialogContent>
        </Dialog>
      </div>

      <KanbanBoard initialDeals={(deals ?? []) as any} contacts={contacts ?? []} />
    </div>
  )
}
