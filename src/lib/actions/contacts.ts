"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

function parseContactFields(formData: FormData, type: string) {
  const base = {
    name: formData.get("name") as string,
    email: formData.get("email") as string || null,
    phone: formData.get("phone") as string || null,
    company: formData.get("company") as string || null,
    type,
  }

  if (type === "client") {
    return {
      ...base,
      current_title: formData.get("current_title") as string || null,
      desired_specialty: formData.get("desired_specialty") as string || null,
      salary_budget_min: formData.get("salary_budget_min") ? Number(formData.get("salary_budget_min")) : null,
      salary_budget_max: formData.get("salary_budget_max") ? Number(formData.get("salary_budget_max")) : null,
      desired_contract_length: formData.get("desired_contract_length") as string || null,
      desired_availability: formData.get("desired_availability") as string || null,
    }
  }

  if (type !== "candidate") return base

  const skillsRaw = formData.get("skills") as string
  const skills = skillsRaw
    ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean)
    : null

  return {
    ...base,
    linkedin_url: formData.get("linkedin_url") as string || null,
    current_title: formData.get("current_title") as string || null,
    years_experience: formData.get("years_experience") ? Number(formData.get("years_experience")) : null,
    skills,
    salary_expectation: formData.get("salary_expectation") ? Number(formData.get("salary_expectation")) : null,
    location: formData.get("location") as string || null,
    remote_preference: formData.get("remote_preference") as string || null,
    availability_status: formData.get("availability_status") as string || null,
    contract_length: formData.get("contract_length") as string || null,
    availability_window: formData.get("availability_window") as string || null,
  }
}

export async function createContact(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const type = formData.get("type") as string || "candidate"
  const { error } = await supabase.from("contacts").insert({
    user_id: user.id,
    ...parseContactFields(formData, type),
  })

  if (error) return { error: error.message }
  revalidatePath("/contacts")
  return { success: true }
}

export async function updateContact(id: string, formData: FormData) {
  const supabase = await createClient()

  const type = formData.get("type") as string || "candidate"
  const { error } = await supabase.from("contacts")
    .update(parseContactFields(formData, type))
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/contacts")
  revalidatePath(`/contacts/${id}`)
  return { success: true }
}

export async function deleteContact(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("contacts").delete().eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/contacts")
  return { success: true }
}
