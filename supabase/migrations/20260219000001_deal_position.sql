-- Add position column to deals
alter table deals add column position integer not null default 0;

-- Set initial positions based on created_at order within each stage
with ranked as (
  select id, row_number() over (partition by stage order by created_at asc) - 1 as pos
  from deals
)
update deals set position = ranked.pos
from ranked
where deals.id = ranked.id;
