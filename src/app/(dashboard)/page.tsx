import { Users, Handshake, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import KpiCard from "@/components/kpi-card"

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: contactCount },
    { data: deals },
  ] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("deals").select("value, stage"),
  ])

  const openDeals = deals?.filter(d => d.stage !== "Won" && d.stage !== "Lost") ?? []
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here&apos;s what&apos;s going on.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total Contacts"
          value={contactCount ?? 0}
          icon={Users}
        />
        <KpiCard
          title="Open Deals"
          value={openDeals.length}
          sub={`${deals?.length ?? 0} total`}
          icon={Handshake}
        />
        <KpiCard
          title="Pipeline Value"
          value={`$${pipelineValue.toLocaleString()}`}
          sub="across open deals"
          icon={DollarSign}
        />
      </div>
    </div>
  )
}
