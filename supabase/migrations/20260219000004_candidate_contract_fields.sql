alter table contacts
  add column if not exists contract_length text,
  add column if not exists availability_window text;
