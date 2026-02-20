import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ContactForm from "@/components/contact-form"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function ContactsPage() {
  const supabase = await createClient()
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">{contacts?.length ?? 0} total</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New contact</DialogTitle>
            </DialogHeader>
            <ContactForm />
          </DialogContent>
        </Dialog>
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
    </div>
  )
}
