import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { deleteContact } from "@/lib/actions/contacts"
import ContactDialog from "@/components/contact-dialog"
import ActivityLog from "@/components/activity-log"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Trash2, ExternalLink } from "lucide-react"

const AVAILABILITY_LABEL: Record<string, string> = {
  actively_looking: "Actively Looking",
  open: "Open to Opportunities",
  not_looking: "Not Looking",
}

const REMOTE_LABEL: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
  flexible: "Flexible",
}

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single()

  if (!contact) notFound()

  const [{ data: deals }, { data: activities }] = await Promise.all([
    supabase.from("deals").select("*").eq("contact_id", id).order("created_at", { ascending: false }),
    supabase.from("activities").select("*").eq("contact_id", id).order("created_at", { ascending: false }),
  ])

  const isCandidate = contact.type === "candidate"

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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{contact.name}</h1>
            <Badge variant={isCandidate ? "default" : "secondary"}>
              {isCandidate ? "Candidate" : "Client"}
            </Badge>
          </div>
          {contact.current_title && (
            <p className="text-muted-foreground mt-0.5">{contact.current_title}</p>
          )}
          {contact.company && !contact.current_title && (
            <p className="text-muted-foreground mt-0.5">{contact.company}</p>
          )}
          {contact.current_title && contact.company && (
            <p className="text-muted-foreground text-sm">at {contact.company}</p>
          )}
        </div>
        <div className="flex gap-2">
          <ContactDialog contact={contact} />
          <form action={async () => {
            "use server"
            await deleteContact(id)
          }}>
            <Button variant="outline" size="sm" type="submit">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      {/* Availability badge for candidates */}
      {isCandidate && contact.availability_status && (
        <Badge variant={
          contact.availability_status === "actively_looking" ? "default" :
          contact.availability_status === "open" ? "secondary" : "outline"
        }>
          {AVAILABILITY_LABEL[contact.availability_status] ?? contact.availability_status}
        </Badge>
      )}

      {/* Core details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {contact.email && (
            <div className="flex gap-2">
              <span className="text-muted-foreground w-28">Email</span>
              <span>{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex gap-2">
              <span className="text-muted-foreground w-28">Phone</span>
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.company && (
            <div className="flex gap-2">
              <span className="text-muted-foreground w-28">Company</span>
              <span>{contact.company}</span>
            </div>
          )}
          {contact.location && (
            <div className="flex gap-2">
              <span className="text-muted-foreground w-28">Location</span>
              <span>{contact.location}</span>
            </div>
          )}
          <div className="flex gap-2">
              <span className="text-muted-foreground w-28">Added</span>
              <span>{new Date(contact.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          {contact.linkedin_url && (
            <div className="flex gap-2">
              <span className="text-muted-foreground w-28">LinkedIn</span>
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                View profile <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate-specific fields */}
      {isCandidate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Candidate Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {contact.years_experience != null && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28">Experience</span>
                <span>{contact.years_experience} years</span>
              </div>
            )}
            {contact.salary_expectation != null && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28">Salary</span>
                <span>${contact.salary_expectation.toLocaleString()}</span>
              </div>
            )}
            {contact.remote_preference && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28">Remote</span>
                <span>{REMOTE_LABEL[contact.remote_preference] ?? contact.remote_preference}</span>
              </div>
            )}
            {contact.skills && contact.skills.length > 0 && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28 shrink-0">Skills</span>
                <div className="flex flex-wrap gap-1">
                  {contact.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deals */}
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

      {/* Activity log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Activity ({activities?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityLog contactId={id} activities={activities ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
