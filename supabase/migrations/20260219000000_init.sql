-- contacts
create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  email text,
  phone text,
  company text,
  created_at timestamptz default now()
);
alter table contacts enable row level security;
create policy "users see own contacts" on contacts
  for all using (auth.uid() = user_id);

-- deals
create type deal_stage as enum ('Lead','Qualified','Proposal','Won','Lost');
create table deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  value numeric default 0,
  stage deal_stage default 'Lead',
  contact_id uuid references contacts,
  created_at timestamptz default now()
);
alter table deals enable row level security;
create policy "users see own deals" on deals
  for all using (auth.uid() = user_id);

-- activities
create table activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  type text not null,
  body text,
  contact_id uuid references contacts,
  deal_id uuid references deals,
  created_at timestamptz default now()
);
alter table activities enable row level security;
create policy "users see own activities" on activities
  for all using (auth.uid() = user_id);
