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

export default async function ContactsPage({
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
    .order("created_at", { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
    )
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
          <SearchInput placeholder="Search contacts…" />
          <ContactDialog />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No contacts yet. Add your first one.
                </TableCell>
              </TableRow>
            )}
            {contacts?.map(contact => (
              <TableRow key={contact.id}>
                <TableCell>
                  <Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">
                    {contact.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{contact.email ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{contact.phone ?? "—"}</TableCell>
                <TableCell>
                  {contact.company
                    ? <Badge variant="secondary">{contact.company}</Badge>
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
              <Link href={`/contacts?page=${page - 1}`}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
              <Link href={`/contacts?page=${page + 1}`}>
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
