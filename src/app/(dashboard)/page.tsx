import { Users, Handshake, DollarSign, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import KpiCard from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: contactCount },
    { data: deals },
    { data: recentContacts },
    { data: recentDeals },
  ] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("deals").select("value, stage"),
    supabase.from("contacts").select("id, name, type, company, current_title").order("created_at", { ascending: false }).limit(5),
    supabase.from("deals").select("id, title, stage, value").order("created_at", { ascending: false }).limit(5),
  ])

  const openDeals = deals?.filter(d => d.stage !== "Won" && d.stage !== "Lost") ?? []
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0)

  const STAGE_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    Lead: "secondary",
    Qualified: "outline",
    Proposal: "default",
    Won: "default",
    Lost: "destructive",
  }

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Contacts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Contacts</CardTitle>
            <Link
              href="/contacts"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentContacts?.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No contacts yet.</p>
            )}
            {recentContacts?.map(contact => (
              <div key={contact.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="text-sm font-medium hover:underline truncate block"
                  >
                    {contact.name}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">
                    {contact.current_title ?? contact.company ?? "—"}
                  </p>
                </div>
                <Badge variant={contact.type === "candidate" ? "default" : "secondary"} className="shrink-0 text-xs">
                  {contact.type === "candidate" ? "Candidate" : "Client"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Deals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Deals</CardTitle>
            <Link
              href="/deals"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDeals?.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No deals yet.</p>
            )}
            {recentDeals?.map(deal => (
              <div key={deal.id} className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">{deal.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {deal.value != null && (
                    <span className="text-xs text-muted-foreground">${deal.value.toLocaleString()}</span>
                  )}
                  <Badge variant={STAGE_VARIANT[deal.stage] ?? "outline"} className="text-xs">
                    {deal.stage}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
