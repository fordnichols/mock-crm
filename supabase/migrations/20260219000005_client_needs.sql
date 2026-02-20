alter table contacts
  add column if not exists desired_specialty text,
  add column if not exists salary_budget_min integer,
  add column if not exists salary_budget_max integer,
  add column if not exists desired_contract_length text,
  add column if not exists desired_availability text;
