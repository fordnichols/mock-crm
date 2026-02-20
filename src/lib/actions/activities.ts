"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createActivity(contactId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("activities").insert({
    user_id: user.id,
    contact_id: contactId,
    type: formData.get("type") as string,
    body: formData.get("body") as string,
  })

  if (error) return { error: error.message }
  revalidatePath(`/contacts/${contactId}`)
  return { success: true }
}

export async function deleteActivity(id: string, contactId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("activities").delete().eq("id", id)

  if (error) return { error: error.message }
  revalidatePath(`/contacts/${contactId}`)
  return { success: true }
}
