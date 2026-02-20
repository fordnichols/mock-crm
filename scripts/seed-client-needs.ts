import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const EMAIL = process.env.SEED_EMAIL!
const PASSWORD = process.env.SEED_PASSWORD!

const SPECIALTIES = [
  "Cardiothoracic Surgery",
  "Neurosurgery",
  "Orthopedic Surgery",
  "General Surgery",
  "Vascular Surgery",
  "Pediatric Surgery",
  "Trauma Surgery",
  "Spine Surgery",
  "Transplant Surgery",
  "Surgical Oncology",
]

const CONTRACT_LENGTHS = ["1 month", "3 months", "6 months", "12 months", "Ongoing"]
const AVAILABILITIES = ["Immediate", "2 weeks", "1 month", "2 months"]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function seedClientNeeds() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  if (authError || !user) {
    console.error("Auth failed:", authError?.message)
    process.exit(1)
  }

  console.log(`Signed in as ${user.email}`)

  const { data: clients, error } = await supabase
    .from("contacts")
    .select("id")
    .eq("type", "client")

  if (error || !clients) {
    console.error("Failed to fetch clients:", error?.message)
    process.exit(1)
  }

  console.log(`Updating ${clients.length} clients with hiring needs...`)

  for (const client of clients) {
    const budgetMin = randomInt(800, 2000)
    const budgetMax = budgetMin + randomInt(300, 1000)
    await supabase.from("contacts").update({
      desired_specialty: randomFrom(SPECIALTIES),
      salary_budget_min: budgetMin,
      salary_budget_max: budgetMax,
      desired_contract_length: randomFrom(CONTRACT_LENGTHS),
      desired_availability: randomFrom(AVAILABILITIES),
    }).eq("id", client.id)
  }

  console.log("✓ Done")
  process.exit(0)
}

seedClientNeeds()
