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
  contract_length: string | null
  availability_window: string | null
  desired_specialty: string | null
  salary_budget_min: number | null
  salary_budget_max: number | null
  desired_contract_length: string | null
  desired_availability: string | null
}

interface ContactDialogProps {
  contact?: Contact
  defaultType?: "candidate" | "client"
}

export default function ContactDialog({ contact, defaultType }: ContactDialogProps) {
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
        <ContactForm contact={contact} defaultType={defaultType} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
