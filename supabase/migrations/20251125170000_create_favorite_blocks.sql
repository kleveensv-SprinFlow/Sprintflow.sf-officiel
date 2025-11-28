create table if not exists favorite_blocks (
  id uuid default gen_random_uuid() primary key,
  coach_id uuid references auth.users(id) not null,
  name text,
  block_data jsonb not null,
  created_at timestamptz default now()
);

-- RLS Policies
alter table favorite_blocks enable row level security;

create policy "Coaches can CRUD their own favorite blocks"
  on favorite_blocks for all
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);
