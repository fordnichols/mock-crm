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
  "Plastic & Reconstructive Surgery",
  "Vascular Surgery",
  "Pediatric Surgery",
  "Colorectal Surgery",
  "Urological Surgery",
  "Hepatobiliary Surgery",
  "Trauma Surgery",
  "Bariatric Surgery",
  "Transplant Surgery",
  "Endocrine Surgery",
  "Thoracic Surgery",
  "Spine Surgery",
  "Hand Surgery",
  "Robotic Surgery",
  "Surgical Oncology",
  "Laparoscopic Surgery",
  "Maxillofacial Surgery",
]

const CONTRACT_LENGTHS = [
  "1 month",
  "3 months",
  "6 months",
  "12 months",
  "Ongoing",
]

const AVAILABILITY_WINDOWS = [
  "Immediate",
  "2 weeks",
  "1 month",
  "2 months",
  "3 months",
]

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function seed() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  if (authError || !user) {
    console.error("Auth failed:", authError?.message)
    process.exit(1)
  }

  console.log(`Signed in as ${user.email}`)

  const { data: candidates, error } = await supabase
    .from("contacts")
    .select("id")
    .eq("type", "candidate")

  if (error || !candidates) {
    console.error("Failed to fetch candidates:", error?.message)
    process.exit(1)
  }

  console.log(`Updating ${candidates.length} candidates...`)

  for (const candidate of candidates) {
    await supabase.from("contacts").update({
      skills: pickRandom(SPECIALTIES, 1),
      contract_length: CONTRACT_LENGTHS[randomInt(0, CONTRACT_LENGTHS.length - 1)],
      availability_window: AVAILABILITY_WINDOWS[randomInt(0, AVAILABILITY_WINDOWS.length - 1)],
      salary_expectation: randomInt(800, 3500),
    }).eq("id", candidate.id)
  }

  console.log("✓ Done")
  process.exit(0)
}

seed()
