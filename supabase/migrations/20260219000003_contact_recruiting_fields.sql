-- Contact type
create type contact_type as enum ('candidate', 'client');
alter table contacts add column type contact_type not null default 'candidate';

-- Candidate-specific fields
alter table contacts add column linkedin_url text;
alter table contacts add column current_title text;
alter table contacts add column years_experience integer;
alter table contacts add column skills text[];
alter table contacts add column salary_expectation integer;
alter table contacts add column location text;
alter table contacts add column remote_preference text;
alter table contacts add column availability_status text;

-- Activity type enum
create type activity_type as enum ('note', 'call', 'email');
alter table activities alter column type type activity_type using type::activity_type;
