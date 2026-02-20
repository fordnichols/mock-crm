import { createClient } from "@supabase/supabase-js"
import { faker } from "@faker-js/faker"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const EMAIL = process.env.SEED_EMAIL!
const PASSWORD = process.env.SEED_PASSWORD!

const STAGES = ["Lead", "Qualified", "Proposal", "Won", "Lost"] as const

async function seed() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Sign in so RLS lets us write data
  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  })

  if (authError || !user) {
    console.error("Auth failed:", authError?.message)
    process.exit(1)
  }

  console.log(`Signed in as ${user.email}`)

  // Seed contacts
  console.log("Seeding 100 contacts...")
  const contacts = Array.from({ length: 100 }, () => ({
    user_id: user.id,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number({ style: "national" }),
    company: faker.company.name(),
  }))

  const { data: insertedContacts, error: contactError } = await supabase
    .from("contacts")
    .insert(contacts)
    .select("id")

  if (contactError) {
    console.error("Contact seed failed:", contactError.message)
    process.exit(1)
  }

  console.log(`✓ Created ${insertedContacts?.length} contacts`)

  // Seed deals
  console.log("Seeding 1000 deals...")
  const deals = Array.from({ length: 1000 }, () => ({
    user_id: user.id,
    title: `${faker.company.name()} — ${faker.commerce.productName()}`,
    value: faker.number.int({ min: 1000, max: 100000 }),
    stage: faker.helpers.arrayElement(STAGES),
    contact_id: faker.helpers.arrayElement(insertedContacts!).id,
  }))

  // Insert in batches of 100 to avoid hitting request size limits
  for (let i = 0; i < deals.length; i += 100) {
    const batch = deals.slice(i, i + 100)
    const { error: dealError } = await supabase.from("deals").insert(batch)
    if (dealError) {
      console.error(`Deal batch ${i / 100 + 1} failed:`, dealError.message)
      process.exit(1)
    }
    console.log(`  Inserted deals ${i + 1}–${Math.min(i + 100, deals.length)}`)
  }

  console.log("✓ Done seeding.")
  process.exit(0)
}

seed()
