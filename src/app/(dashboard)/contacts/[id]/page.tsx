import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { deleteContact } from "@/lib/actions/contacts"
import ContactForm from "@/components/contact-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single()

  if (!contact) notFound()

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("contact_id", id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/contacts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Contacts
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{contact.name}</h1>
          {contact.company && (
            <Badge variant="secondary" className="mt-1">{contact.company}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit contact</DialogTitle>
              </DialogHeader>
              <ContactForm contact={contact} />
            </DialogContent>
          </Dialog>
          <form action={async () => {
            "use server"
            await deleteContact(id)
          }}>
            <Button variant="destructive" size="sm" type="submit">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20">Email</span>
            <span>{contact.email ?? "—"}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20">Phone</span>
            <span>{contact.phone ?? "—"}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20">Company</span>
            <span>{contact.company ?? "—"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Deals ({deals?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deals?.length === 0
            ? <p className="text-sm text-muted-foreground">No deals linked to this contact.</p>
            : (
              <ul className="space-y-2">
                {deals?.map(deal => (
                  <li key={deal.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{deal.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">${deal.value?.toLocaleString()}</span>
                      <Badge variant="outline">{deal.stage}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </CardContent>
      </Card>
    </div>
  )
}
