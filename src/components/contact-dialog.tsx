"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ContactForm from "@/components/contact-form"
import { Plus, Pencil } from "lucide-react"

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
}

interface ContactDialogProps {
  contact?: Contact
}

export default function ContactDialog({ contact }: ContactDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {contact ? (
          <Button variant="outline" size="sm" className="cursor-pointer">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <Button className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add contact
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? "Edit contact" : "New contact"}</DialogTitle>
        </DialogHeader>
        <ContactForm contact={contact} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
