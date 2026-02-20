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
import TypeFilter from "@/components/type-filter"
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

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; type?: string }>
}) {
  const { page: pageParam, search = "", type = "" } = await searchParams
  const page = Math.max(1, Number(pageParam ?? 1))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  let query = supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
    )
  }

  if (type === "candidate" || type === "client") {
    query = query.eq("type", type)
  }

  const { data: contacts, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">{count ?? 0} total</p>
        </div>
        <div className="flex items-center gap-3">
          <TypeFilter />
          <SearchInput placeholder="Search contacts…" />
          <ContactDialog />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
            {contacts?.map((contact, i) => (
              <TableRow key={contact.id} className={`h-16 hover:bg-blue-50 ${i % 2 === 1 ? "bg-muted/40" : ""}`}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 shrink-0 rounded-full bg-gradient-to-br ${getGradient(contact.name)} flex items-center justify-center text-white text-sm font-semibold`}>
                      {getInitials(contact.name)}
                    </div>
                    <Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">
                      {contact.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant={contact.type === "candidate" ? "default" : "secondary"}>
                    {contact.type === "candidate" ? "Candidate" : "Client"}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
                    {contact.email && <span>{contact.email}</span>}
                    {contact.phone && <span>{contact.phone}</span>}
                    {!contact.email && !contact.phone && <span>—</span>}
                    <span className="text-xs">
                      Added {new Date(contact.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  {contact.company
                    ? <Badge variant="outline">{contact.company}</Badge>
                    : <span className="text-muted-foreground">—</span>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild disabled={page <= 1}>
              <Link href={`/contacts?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${type ? `&type=${type}` : ""}`}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
              <Link href={`/contacts?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${type ? `&type=${type}` : ""}`}>
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
