"use client"

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { updateDealStage } from "@/lib/actions/deals"
import DealCard from "@/components/deal-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const STAGES = ["Lead", "Qualified", "Proposal", "Won", "Lost"] as const
type DealStage = typeof STAGES[number]

interface Deal {
  id: string
  title: string
  value: number | null
  stage: DealStage
  contact?: { name: string } | null
}

export default function KanbanBoard({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState(initialDeals)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }))

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const newStage = over.id as DealStage
    if (!STAGES.includes(newStage)) return

    // Optimistic update — move the card immediately in the UI
    setDeals(prev =>
      prev.map(d => d.id === active.id ? { ...d, stage: newStage } : d)
    )

    // Persist to Supabase in the background
    await updateDealStage(active.id as string, newStage)
  }

  const activeDeal = deals.find(d => d.id === activeId)

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage)
          return (
            <div key={stage} className="flex flex-col gap-2 w-64 shrink-0">
              <div className="flex items-center gap-2 px-1">
                <h3 className="text-sm font-semibold">{stage}</h3>
                <Badge variant="secondary" className="text-xs">{stageDeals.length}</Badge>
              </div>
              <SortableContext
                id={stage}
                items={stageDeals.map(d => d.id)}
                strategy={verticalListSortingStrategy}
              >
                <Card
                  className="flex-1 min-h-32 bg-muted/40"
                  data-droppable-id={stage}
                >
                  <CardContent className="p-2 space-y-2">
                    {stageDeals.map(deal => (
                      <DealCard key={deal.id} deal={deal} />
                    ))}
                  </CardContent>
                </Card>
              </SortableContext>
            </div>
          )
        })}
      </div>
      </div>

      <DragOverlay>
        {activeDeal && <DealCard deal={activeDeal} />}
      </DragOverlay>
    </DndContext>
  )
}
