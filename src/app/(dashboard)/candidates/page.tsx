import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ContactDialog from "@/components/contact-dialog"
import SearchInput from "@/components/search-input"
import SpecialtyFilter from "@/components/specialty-filter"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE = 25

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

const AVAILABILITY_PILL: Record<string, string> = {
  actively_looking: "bg-green-100 text-green-700",
  open: "bg-amber-100 text-amber-700",
  not_looking: "bg-slate-100 text-slate-600",
}

const AVAILABILITY_LABEL: Record<string, string> = {
  actively_looking: "Actively Looking",
  open: "Open",
  not_looking: "Not Looking",
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; specialty?: string }>
}) {
  const { page: pageParam, search = "", specialty = "" } = await searchParams
  const page = Math.max(1, Number(pageParam ?? 1))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  let query = supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .eq("type", "candidate")
    .order("name", { ascending: true })
    .range(from, to)

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
    )
  }

  if (specialty) {
    query = query.contains("skills", [specialty])
  }

  const { data: candidates, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">{count ?? 0} total</p>
        </div>
        <div className="flex items-center gap-3">
          <SpecialtyFilter />
          <SearchInput placeholder="Search candidates…" />
          <ContactDialog defaultType="candidate" />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Available In</TableHead>
              <TableHead>Contract</TableHead>
              <TableHead>Salary/day</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No candidates found.
                </TableCell>
              </TableRow>
            )}
            {candidates?.map((candidate, i) => (
              <TableRow key={candidate.id} className={`h-16 hover:bg-blue-50 ${i % 2 === 1 ? "bg-muted/40" : ""}`}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 shrink-0 rounded-full bg-gradient-to-br ${getGradient(candidate.name)} flex items-center justify-center text-white text-sm font-semibold`}>
                      {getInitials(candidate.name)}
                    </div>
                    <Link href={`/contacts/${candidate.id}`} className="font-medium hover:underline">
                      {candidate.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  {candidate.skills?.[0]
                    ? <Badge variant="secondary" className="text-xs font-normal">{candidate.skills[0]}</Badge>
                    : <span className="text-muted-foreground">—</span>
                  }
                </TableCell>
                <TableCell className="py-3">
                  {candidate.availability_status
                    ? <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${AVAILABILITY_PILL[candidate.availability_status] ?? "bg-slate-100 text-slate-600"}`}>
                        {AVAILABILITY_LABEL[candidate.availability_status] ?? candidate.availability_status}
                      </span>
                    : <span className="text-muted-foreground">—</span>
                  }
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">
                  {candidate.availability_window ?? "—"}
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">
                  {candidate.contract_length ?? "—"}
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">
                  {candidate.salary_expectation != null
                    ? `$${candidate.salary_expectation.toLocaleString()}`
                    : "—"
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild disabled={page <= 1}>
              <Link href={`/candidates?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
              <Link href={`/candidates?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
