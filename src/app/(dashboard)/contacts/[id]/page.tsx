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

const AVAILABILITY_PILL: Record<string, string> = {
  actively_looking: "bg-green-100 text-green-700",
  open: "bg-amber-100 text-amber-700",
  not_looking: "bg-slate-100 text-slate-600",
}

const STAGE_PILL: Record<string, string> = {
  Lead: "bg-blue-100 text-blue-700",
  Qualified: "bg-violet-100 text-violet-700",
  Proposal: "bg-amber-100 text-amber-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-slate-100 text-slate-600",
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

  const isCandidate = contact.type === "candidate"

  const [{ data: deals }, { data: activities }, { data: recommendations }] = await Promise.all([
    supabase.from("deals").select("*").eq("contact_id", id).order("created_at", { ascending: false }),
    supabase.from("activities").select("*").eq("contact_id", id).order("created_at", { ascending: false }),
    !isCandidate && contact.desired_specialty
      ? supabase
          .from("contacts")
          .select("id, name, skills, availability_status, salary_expectation, availability_window, contract_length")
          .eq("type", "candidate")
          .neq("availability_status", "not_looking")
          .contains("skills", [contact.desired_specialty])
          .gte("salary_expectation", contact.salary_budget_min ?? 0)
          .lte("salary_expectation", contact.salary_budget_max ?? 999999)
          .order("salary_expectation", { ascending: true })
          .limit(5)
      : Promise.resolve({ data: null }),
  ])

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href={isCandidate ? "/candidates" : "/clients"}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isCandidate ? "Candidates" : "Clients"}
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{contact.name}</h1>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${isCandidate ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
              {isCandidate ? "Candidate" : "Client"}
            </span>
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
        <div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${AVAILABILITY_PILL[contact.availability_status] ?? "bg-slate-100 text-slate-600"}`}>
            {AVAILABILITY_LABEL[contact.availability_status] ?? contact.availability_status}
          </span>
        </div>
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

      {/* Candidate profile */}
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
                <span className="text-muted-foreground w-28">Salary/day</span>
                <span>${contact.salary_expectation.toLocaleString()}</span>
              </div>
            )}
            {contact.remote_preference && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28">Remote</span>
                <span>{REMOTE_LABEL[contact.remote_preference] ?? contact.remote_preference}</span>
              </div>
            )}
            {contact.contract_length && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28">Contract</span>
                <span>{contact.contract_length}</span>
              </div>
            )}
            {contact.availability_window && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28">Available in</span>
                <span>{contact.availability_window}</span>
              </div>
            )}
            {contact.skills && contact.skills.length > 0 && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28 shrink-0">Specialty</span>
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

      {/* Client hiring needs */}
      {!isCandidate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Hiring Needs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {contact.desired_specialty && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-36">Specialty Needed</span>
                <Badge variant="secondary">{contact.desired_specialty}</Badge>
              </div>
            )}
            {(contact.salary_budget_min != null || contact.salary_budget_max != null) && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-36">Budget/day</span>
                <span>
                  ${contact.salary_budget_min?.toLocaleString() ?? "—"} – ${contact.salary_budget_max?.toLocaleString() ?? "—"}
                </span>
              </div>
            )}
            {contact.desired_contract_length && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-36">Contract Length</span>
                <span>{contact.desired_contract_length}</span>
              </div>
            )}
            {contact.desired_availability && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-36">Needs Surgeon By</span>
                <span>{contact.desired_availability}</span>
              </div>
            )}
            {!contact.desired_specialty && !contact.salary_budget_min && (
              <p className="text-muted-foreground">No hiring needs set. Edit this client to add them.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommended candidates */}
      {!isCandidate && contact.desired_specialty && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recommended Candidates
              {recommendations && recommendations.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {recommendations.length} match{recommendations.length !== 1 ? "es" : ""} for {contact.desired_specialty}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!recommendations || recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No candidates currently match this client&apos;s needs. Try adjusting the budget or specialty.
              </p>
            ) : (
              <ul className="divide-y">
                {recommendations.map(candidate => (
                  <li key={candidate.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="min-w-0">
                      <Link href={`/contacts/${candidate.id}`} className="text-sm font-medium hover:underline">
                        {candidate.name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {candidate.contract_length ?? "—"} contract · Available in {candidate.availability_window ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm text-muted-foreground">
                        ${candidate.salary_expectation?.toLocaleString()}/day
                      </span>
                      {candidate.availability_status && (
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${AVAILABILITY_PILL[candidate.availability_status] ?? "bg-slate-100 text-slate-600"}`}>
                          {AVAILABILITY_LABEL[candidate.availability_status] ?? candidate.availability_status}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
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
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STAGE_PILL[deal.stage] ?? "bg-slate-100 text-slate-600"}`}>
                        {deal.stage}
                      </span>
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
