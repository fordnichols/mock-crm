import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon, TrendingUp } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  sub?: string
  icon: LucideIcon
  gradient: string
  trend: string
}

export default function KpiCard({ title, value, sub, icon: Icon, gradient, trend }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
