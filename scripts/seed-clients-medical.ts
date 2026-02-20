import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const EMAIL = process.env.SEED_EMAIL!
const PASSWORD = process.env.SEED_PASSWORD!

const HOSPITALS = [
  "Massachusetts General Hospital",
  "Mayo Clinic",
  "Cleveland Clinic",
  "Johns Hopkins Hospital",
  "UCSF Medical Center",
  "Cedars-Sinai Medical Center",
  "NYU Langone Health",
  "Stanford Health Care",
  "Mount Sinai Hospital",
  "Northwestern Memorial Hospital",
  "Houston Methodist Hospital",
  "Brigham and Women's Hospital",
  "Duke University Hospital",
  "UCLA Medical Center",
  "Vanderbilt University Medical Center",
  "UPMC Presbyterian",
  "Emory University Hospital",
  "Barnes-Jewish Hospital",
  "Rush University Medical Center",
  "Scripps Memorial Hospital",
]

const TITLES = [
  "Chief of Surgery",
  "Director of Surgical Services",
  "VP of Medical Affairs",
  "Head of Perioperative Services",
  "Director of Physician Recruitment",
  "Chief Medical Officer",
  "Director of Talent Acquisition",
  "VP of Human Resources",
  "Surgical Department Administrator",
  "Head of Clinical Staffing",
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function seedClientsHospitals() {
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

  console.log(`Updating ${clients.length} clients...`)

  for (const client of clients) {
    await supabase.from("contacts").update({
      company: randomFrom(HOSPITALS),
      current_title: randomFrom(TITLES),
    }).eq("id", client.id)
  }

  console.log("✓ Done")
  process.exit(0)
}

seedClientsHospitals()
