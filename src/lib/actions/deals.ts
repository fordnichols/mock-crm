"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

type DealStage = "Lead" | "Qualified" | "Proposal" | "Won" | "Lost"

export async function createDeal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("deals").insert({
    user_id: user.id,
    title: formData.get("title") as string,
    value: Number(formData.get("value") ?? 0),
    stage: (formData.get("stage") as DealStage) ?? "Lead",
    contact_id: formData.get("contact_id") || null,
  })

  if (error) return { error: error.message }
  revalidatePath("/deals")
  return { success: true }
}

export async function updateDealStage(id: string, stage: DealStage) {
  const supabase = await createClient()

  const { error } = await supabase.from("deals").update({ stage }).eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/deals")
  return { success: true }
}

export async function deleteDeal(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("deals").delete().eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/deals")
  return { success: true }
}
