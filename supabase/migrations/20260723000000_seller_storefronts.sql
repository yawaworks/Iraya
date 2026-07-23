-- Link sellers to their own Supabase Auth account, add tiering + custom layout support
alter table sellers add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table sellers add column if not exists tier text not null default 'free' check (tier in ('free', 'premium'));
alter table sellers add column if not exists layout_blocks jsonb not null default '[]'::jsonb;
alter table sellers add column if not exists theme jsonb not null default '{"primaryColor":"#111111","backgroundColor":"#ffffff","fontFamily":"sans"}'::jsonb;

create unique index if not exists idx_sellers_owner on sellers (owner_id) where owner_id is not null;

-- Sellers manage their own seller row (public SELECT policy already exists from init_schema)
create policy "Sellers can insert own seller row" on sellers
  for insert with check (auth.uid() = owner_id);

create policy "Sellers can update own seller row" on sellers
  for update using (auth.uid() = owner_id);

-- Sellers manage their own products — no insert/update policy existed
-- before (only the public SELECT policy from init_schema).
create policy "Sellers can insert own products" on products
  for insert with check (
    seller_id in (select id from sellers where owner_id = auth.uid())
  );

create policy "Sellers can update own products" on products
  for update using (
    seller_id in (select id from sellers where owner_id = auth.uid())
  );