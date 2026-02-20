"use client"

import { memo } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteDeal } from "@/lib/actions/deals"

interface Deal {
  id: string
  title: string
  value: number | null
  stage: string
  contact?: { name: string } | null
}

const DealCard = memo(function DealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className="group cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <CardContent className="p-3">
          <p className="text-sm font-medium leading-snug truncate">{deal.title}</p>
          {deal.contact && (
            <p className="text-xs text-muted-foreground mt-0.5">{deal.contact.name}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            {deal.value != null && deal.value > 0
              ? <Badge variant="secondary" className="text-xs">${deal.value.toLocaleString()}</Badge>
              : <span />
            }
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
              type="button"
              onClick={e => {
                e.stopPropagation()
                deleteDeal(deal.id)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export default DealCard
