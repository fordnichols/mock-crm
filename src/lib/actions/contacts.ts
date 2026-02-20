"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createContact(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("contacts").insert({
    user_id: user.id,
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    company: formData.get("company") as string,
  })

  if (error) return { error: error.message }
  revalidatePath("/contacts")
  return { success: true }
}

export async function updateContact(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from("contacts").update({
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    company: formData.get("company") as string,
  }).eq("id", id)

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
