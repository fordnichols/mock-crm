import { createClient } from "@/lib/supabase/server"
import KanbanBoard from "@/components/kanban-board"
import DealForm from "@/components/deal-form"
import SearchInput from "@/components/search-input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search = "" } = await searchParams
  const supabase = await createClient()

  let dealsQuery = supabase
    .from("deals")
    .select("id, title, value, stage, position, description, close_date, contact_id, contact:contacts(name), created_at")
    .order("stage").order("position", { ascending: true })

  if (search) {
    dealsQuery = dealsQuery.ilike("title", `%${search}%`)
  }

  const [{ data: deals }, { data: contacts }] = await Promise.all([
    dealsQuery,
    supabase.from("contacts").select("id, name").order("name"),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deals</h1>
          <p className="text-muted-foreground">{deals?.length ?? 0} total</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search deals…" />
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
      </div>

      <KanbanBoard initialDeals={(deals ?? []) as any} contacts={contacts ?? []} />
    </div>
  )
}
