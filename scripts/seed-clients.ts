import { createClient } from "@supabase/supabase-js"
import { faker } from "@faker-js/faker"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const EMAIL = process.env.SEED_EMAIL!
const PASSWORD = process.env.SEED_PASSWORD!

const TITLES = [
  "VP of Engineering",
  "Head of Talent",
  "Director of People",
  "CTO",
  "Engineering Manager",
  "Head of Product",
  "Director of Engineering",
  "Chief People Officer",
  "VP of Product",
  "Talent Acquisition Lead",
]

async function seedClients() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })

  if (authError || !user) {
    console.error("Auth failed:", authError?.message)
    process.exit(1)
  }

  console.log(`Signed in as ${user.email}`)

  const clients = Array.from({ length: 10 }, () => ({
    user_id: user.id,
    type: "client",
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number({ style: "national" }),
    company: faker.company.name(),
    current_title: faker.helpers.arrayElement(TITLES),
    location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
  }))

  const { data, error } = await supabase.from("contacts").insert(clients).select("id")

  if (error) {
    console.error("Failed:", error.message)
    process.exit(1)
  }

  console.log(`✓ Created ${data?.length} clients`)
  process.exit(0)
}

seedClients()
