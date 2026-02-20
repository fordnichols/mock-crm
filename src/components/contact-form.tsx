"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createContact, updateContact } from "@/lib/actions/contacts"

interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
}

interface ContactFormProps {
  contact?: Contact
  onSuccess?: () => void
}

export default function ContactForm({ contact, onSuccess }: ContactFormProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
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
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={contact?.name ?? ""} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={contact?.phone ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" name="company" defaultValue={contact?.company ?? ""} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving…" : contact ? "Save changes" : "Add contact"}
      </Button>
    </form>
  )
}
