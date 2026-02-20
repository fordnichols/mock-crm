import { createClient } from "@supabase/supabase-js"
import { faker } from "@faker-js/faker"

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
  "Plastic & Reconstructive Surgery",
  "Colorectal Surgery",
  "Urological Surgery",
  "Hepatobiliary Surgery",
  "Bariatric Surgery",
  "Endocrine Surgery",
  "Thoracic Surgery",
  "Hand Surgery",
  "Robotic Surgery",
  "Laparoscopic Surgery",
  "Maxillofacial Surgery",
]

const CONTRACT_LENGTHS = ["1 month", "3 months", "6 months", "12 months", "Ongoing"]
const AVAILABILITY_WINDOWS = ["Immediate", "2 weeks", "1 month", "2 months", "3 months"]
const AVAILABILITY_STATUSES = ["actively_looking", "open", "not_looking"]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function seedCandidates() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  if (authError || !user) {
    console.error("Auth failed:", authError?.message)
    process.exit(1)
  }

  console.log(`Signed in as ${user.email}`)

  const candidates = Array.from({ length: 700 }, () => ({
    user_id: user.id,
    type: "candidate",
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number({ style: "national" }),
    current_title: "Surgeon",
    location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
    skills: [randomFrom(SPECIALTIES)],
    salary_expectation: randomInt(800, 3500),
    contract_length: randomFrom(CONTRACT_LENGTHS),
    availability_window: randomFrom(AVAILABILITY_WINDOWS),
    availability_status: randomFrom(AVAILABILITY_STATUSES),
    years_experience: randomInt(3, 25),
  }))

  const { data, error } = await supabase.from("contacts").insert(candidates).select("id")

  if (error) {
    console.error("Failed:", error.message)
    process.exit(1)
  }

  console.log(`✓ Created ${data?.length} candidates`)
  process.exit(0)
}

seedCandidates()
