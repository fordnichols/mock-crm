"use client"

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { updateDealStage } from "@/lib/actions/deals"
import DealCard from "@/components/deal-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STAGES = ["Lead", "Qualified", "Proposal", "Won", "Lost"] as const
type DealStage = typeof STAGES[number]

interface Deal {
  id: string
  title: string
  value: number | null
  stage: DealStage
  contact?: { name: string } | null
}

function KanbanColumn({ stage, deals }: { stage: DealStage; deals: Deal[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div className="flex flex-col gap-2 w-64 shrink-0">
      <div className="flex items-center gap-2 px-1">
        <h3 className="text-sm font-semibold">{stage}</h3>
        <Badge variant="secondary" className="text-xs">{deals.length}</Badge>
      </div>
      <SortableContext id={stage} items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex-1 min-h-32 rounded-xl border bg-card p-2 space-y-2 transition-colors",
            isOver && "border-primary bg-primary/5"
          )}
        >
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
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
    if (!over) return

    // over.id is either a stage name (dropped on empty column)
    // or a card id (dropped on another card) — resolve to a stage either way
    let newStage: DealStage
    if (STAGES.includes(over.id as DealStage)) {
      newStage = over.id as DealStage
    } else {
      const overDeal = deals.find(d => d.id === over.id)
      if (!overDeal) return
      newStage = overDeal.stage
    }

    const activeDeal = deals.find(d => d.id === active.id)
    if (!activeDeal || activeDeal.stage === newStage) return

    setDeals(prev =>
      prev.map(d => d.id === active.id ? { ...d, stage: newStage } : d)
    )

    await updateDealStage(active.id as string, newStage)
  }

  const activeDeal = deals.find(d => d.id === activeId)

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STAGES.map(stage => (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={deals.filter(d => d.stage === stage)}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeDeal && <DealCard deal={activeDeal} />}
      </DragOverlay>
    </DndContext>
  )
}
