"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

type DealStage = "Lead" | "Qualified" | "Proposal" | "Won" | "Lost"

export async function createDeal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Place new deal at the end of its stage
  const { count } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("stage", (formData.get("stage") as DealStage) ?? "Lead")

  const { error } = await supabase.from("deals").insert({
    user_id: user.id,
    title: formData.get("title") as string,
    value: Number(formData.get("value") ?? 0),
    stage: (formData.get("stage") as DealStage) ?? "Lead",
    contact_id: formData.get("contact_id") || null,
    position: count ?? 0,
  })

  if (error) return { error: error.message }
  revalidatePath("/deals")
  return { success: true }
}

export async function updateDealPositions(
  updates: { id: string; stage: DealStage; position: number }[]
) {
  const supabase = await createClient()

  // Update each deal's stage and position
  const results = await Promise.all(
    updates.map(({ id, stage, position }) =>
      supabase.from("deals").update({ stage, position }).eq("id", id)
    )
  )

  const failed = results.find(r => r.error)
  if (failed?.error) return { error: failed.error.message }

  revalidatePath("/deals")
  return { success: true }
}

export async function updateDeal(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from("deals").update({
    title: formData.get("title") as string,
    value: Number(formData.get("value") ?? 0),
    stage: formData.get("stage") as DealStage,
    description: formData.get("description") as string,
    close_date: formData.get("close_date") || null,
    contact_id: formData.get("contact_id") || null,
  }).eq("id", id)

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
