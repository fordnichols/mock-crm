"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, GripVertical } from "lucide-react"
import { deleteDeal } from "@/lib/actions/deals"

interface Deal {
  id: string
  title: string
  value: number | null
  stage: string
  contact?: { name: string } | null
}

export default function DealCard({ deal }: { deal: Deal }) {
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
      <Card className="group">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start gap-2">
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 text-muted-foreground cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug truncate">{deal.title}</p>
              {deal.contact && (
                <p className="text-xs text-muted-foreground">{deal.contact.name}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              type="button"
              onClick={() => deleteDeal(deal.id)}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
          {deal.value != null && deal.value > 0 && (
            <Badge variant="secondary" className="text-xs">
              ${deal.value.toLocaleString()}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
