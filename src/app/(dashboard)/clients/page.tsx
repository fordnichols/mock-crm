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

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const { page: pageParam, search = "" } = await searchParams
  const page = Math.max(1, Number(pageParam ?? 1))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  let query = supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .eq("type", "client")
    .order("name", { ascending: true })
    .range(from, to)

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
    )
  }

  const { data: clients, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">{count ?? 0} total</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search clients…" />
          <ContactDialog defaultType="client" />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No clients found.
                </TableCell>
              </TableRow>
            )}
            {clients?.map((client, i) => (
              <TableRow key={client.id} className={`h-16 hover:bg-blue-50 ${i % 2 === 1 ? "bg-muted/40" : ""}`}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 shrink-0 rounded-full bg-gradient-to-br ${getGradient(client.name)} flex items-center justify-center text-white text-sm font-semibold`}>
                      {getInitials(client.name)}
                    </div>
                    <Link href={`/contacts/${client.id}`} className="font-medium hover:underline">
                      {client.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">
                  {client.current_title ?? "—"}
                </TableCell>
                <TableCell className="py-3">
                  {client.company
                    ? <Badge variant="outline">{client.company}</Badge>
                    : <span className="text-muted-foreground">—</span>
                  }
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
                    {client.email && <span>{client.email}</span>}
                    {client.phone && <span>{client.phone}</span>}
                    {!client.email && !client.phone && <span>—</span>}
                  </div>
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">
                  {new Date(client.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
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
              <Link href={`/clients?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
              <Link href={`/clients?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
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
