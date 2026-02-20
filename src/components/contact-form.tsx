"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createContact, updateContact } from "@/lib/actions/contacts"

interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  type: "candidate" | "client"
  linkedin_url: string | null
  current_title: string | null
  years_experience: number | null
  skills: string[] | null
  salary_expectation: number | null
  location: string | null
  remote_preference: string | null
  availability_status: string | null
  contract_length: string | null
  availability_window: string | null
  desired_specialty: string | null
  salary_budget_min: number | null
  salary_budget_max: number | null
  desired_contract_length: string | null
  desired_availability: string | null
}

interface ContactFormProps {
  contact?: Contact
  defaultType?: "candidate" | "client"
  onSuccess?: () => void
}

export default function ContactForm({ contact, defaultType, onSuccess }: ContactFormProps) {
  const router = useRouter()
  const [type, setType] = useState<"candidate" | "client">(contact?.type ?? defaultType ?? "candidate")
  const [availability, setAvailability] = useState(contact?.availability_status ?? "")
  const [remote, setRemote] = useState(contact?.remote_preference ?? "")
  const [contractLength, setContractLength] = useState(contact?.contract_length ?? "")
  const [availabilityWindow, setAvailabilityWindow] = useState(contact?.availability_window ?? "")
  const [desiredContractLength, setDesiredContractLength] = useState(contact?.desired_contract_length ?? "")
  const [desiredAvailability, setDesiredAvailability] = useState(contact?.desired_availability ?? "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    formData.set("type", type)
    formData.set("availability_status", availability)
    formData.set("remote_preference", remote)
    formData.set("contract_length", contractLength)
    formData.set("availability_window", availabilityWindow)
    formData.set("desired_contract_length", desiredContractLength)
    formData.set("desired_availability", desiredAvailability)

    const result = contact
      ? await updateContact(contact.id, formData)
      : await createContact(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as "candidate" | "client")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="candidate">Candidate</SelectItem>
            <SelectItem value="client">Client</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={contact?.name ?? ""} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={contact?.phone ?? ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">{type === "candidate" ? "Current Company" : "Company"}</Label>
        <Input id="company" name="company" defaultValue={contact?.company ?? ""} />
      </div>

      {type === "candidate" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_title">Current Title</Label>
              <Input id="current_title" name="current_title" defaultValue={contact?.current_title ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years_experience">Years Experience</Label>
              <Input id="years_experience" name="years_experience" type="number" min="0" defaultValue={contact?.years_experience ?? ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input id="skills" name="skills" defaultValue={contact?.skills?.join(", ") ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_expectation">Salary Expectation ($)</Label>
              <Input id="salary_expectation" name="salary_expectation" type="number" min="0" defaultValue={contact?.salary_expectation ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={contact?.location ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actively_looking">Actively Looking</SelectItem>
                  <SelectItem value="open">Open to Opportunities</SelectItem>
                  <SelectItem value="not_looking">Not Looking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Remote Preference</Label>
              <Select value={remote} onValueChange={setRemote}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preferred Contract Length</Label>
              <Select value={contractLength} onValueChange={setContractLength}>
                <SelectTrigger>
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 month">1 month</SelectItem>
                  <SelectItem value="3 months">3 months</SelectItem>
                  <SelectItem value="6 months">6 months</SelectItem>
                  <SelectItem value="12 months">12 months</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Availability Window</Label>
              <Select value={availabilityWindow} onValueChange={setAvailabilityWindow}>
                <SelectTrigger>
                  <SelectValue placeholder="Select window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="2 weeks">2 weeks</SelectItem>
                  <SelectItem value="1 month">1 month</SelectItem>
                  <SelectItem value="2 months">2 months</SelectItem>
                  <SelectItem value="3 months">3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input id="linkedin_url" name="linkedin_url" type="url" defaultValue={contact?.linkedin_url ?? ""} placeholder="https://linkedin.com/in/..." />
          </div>
        </>
      )}

      {type === "client" && (
        <>
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Hiring Needs</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desired_specialty">Desired Specialty</Label>
            <Input id="desired_specialty" name="desired_specialty" defaultValue={contact?.desired_specialty ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_budget_min">Budget Min ($/day)</Label>
              <Input id="salary_budget_min" name="salary_budget_min" type="number" min="0" defaultValue={contact?.salary_budget_min ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_budget_max">Budget Max ($/day)</Label>
              <Input id="salary_budget_max" name="salary_budget_max" type="number" min="0" defaultValue={contact?.salary_budget_max ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contract Length Needed</Label>
              <Select value={desiredContractLength} onValueChange={setDesiredContractLength}>
                <SelectTrigger>
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 month">1 month</SelectItem>
                  <SelectItem value="3 months">3 months</SelectItem>
                  <SelectItem value="6 months">6 months</SelectItem>
                  <SelectItem value="12 months">12 months</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Needs Surgeon By</Label>
              <Select value={desiredAvailability} onValueChange={setDesiredAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="Select window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="2 weeks">2 weeks</SelectItem>
                  <SelectItem value="1 month">1 month</SelectItem>
                  <SelectItem value="2 months">2 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving…" : contact ? "Save changes" : "Add contact"}
      </Button>
    </form>
  )
}
