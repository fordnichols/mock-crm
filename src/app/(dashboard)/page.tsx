import { Users, Handshake, DollarSign, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import KpiCard from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const GRADIENTS = [
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-cyan-400 to-sky-500",
  "from-indigo-400 to-violet-500",
  "from-rose-400 to-pink-500",
]

function getGradient(name: string) {
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return GRADIENTS[sum % GRADIENTS.length]
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const STAGE_PILL: Record<string, string> = {
  Lead: "bg-blue-100 text-blue-700",
  Qualified: "bg-violet-100 text-violet-700",
  Proposal: "bg-amber-100 text-amber-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-slate-100 text-slate-600",
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: contactCount },
    { data: deals },
    { data: recentCandidates },
    { data: recentClients },
    { data: recentDeals },
  ] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("deals").select("value, stage"),
    supabase.from("contacts").select("id, name, company, current_title, skills").eq("type", "candidate").order("created_at", { ascending: false }).limit(5),
    supabase.from("contacts").select("id, name, company, current_title").eq("type", "client").order("created_at", { ascending: false }).limit(5),
    supabase.from("deals").select("id, title, stage, value").order("created_at", { ascending: false }).limit(5),
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
          gradient="from-violet-500 to-indigo-600"
          trend="+12%"
        />
        <KpiCard
          title="Open Deals"
          value={openDeals.length}
          sub={`${deals?.length ?? 0} total`}
          icon={Handshake}
          gradient="from-blue-500 to-cyan-500"
          trend="+8%"
        />
        <KpiCard
          title="Pipeline Value"
          value={`$${pipelineValue.toLocaleString()}`}
          sub="across open deals"
          icon={DollarSign}
          gradient="from-emerald-500 to-teal-500"
          trend="+23%"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Candidates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Candidates</CardTitle>
            <Link href="/candidates" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentCandidates?.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No candidates yet.</p>
            )}
            {recentCandidates?.map((candidate, i) => (
              <div key={candidate.id} className={`flex items-center gap-3 px-4 h-14 ${i % 2 === 1 ? "bg-muted/70" : ""}`}>
                <div className={`h-8 w-8 shrink-0 rounded-full bg-gradient-to-br ${getGradient(candidate.name)} flex items-center justify-center text-white text-xs font-semibold`}>
                  {getInitials(candidate.name)}
                </div>
                <div className="min-w-0">
                  <Link href={`/contacts/${candidate.id}`} className="text-sm font-medium hover:underline truncate block">
                    {candidate.name}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">
                    {candidate.skills?.[0] ?? candidate.current_title ?? "—"}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Clients</CardTitle>
            <Link href="/clients" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentClients?.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No clients yet.</p>
            )}
            {recentClients?.map((client, i) => (
              <div key={client.id} className={`flex items-center gap-3 px-4 h-14 ${i % 2 === 1 ? "bg-muted/70" : ""}`}>
                <div className={`h-8 w-8 shrink-0 rounded-full bg-gradient-to-br ${getGradient(client.name)} flex items-center justify-center text-white text-xs font-semibold`}>
                  {getInitials(client.name)}
                </div>
                <div className="min-w-0">
                  <Link href={`/contacts/${client.id}`} className="text-sm font-medium hover:underline truncate block">
                    {client.name}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">
                    {client.current_title ?? client.company ?? "—"}
                  </p>
                </div>
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
          <CardContent className="p-0">
            {recentDeals?.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No deals yet.</p>
            )}
            {recentDeals?.map((deal, i) => (
              <div key={deal.id} className={`flex items-center justify-between gap-2 px-6 h-14 ${i % 2 === 1 ? "bg-muted/70" : ""}`}>
                <span className="text-sm font-medium truncate">{deal.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {deal.value != null && (
                    <span className="text-xs text-muted-foreground">
                      {deal.value > 50000 ? "🔥 " : ""}${deal.value.toLocaleString()}
                    </span>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STAGE_PILL[deal.stage] ?? "bg-slate-100 text-slate-600"}`}>
                    {deal.stage}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
