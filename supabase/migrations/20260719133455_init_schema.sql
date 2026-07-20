-- ============================================
-- Iraya Initial Schema
-- ============================================

-- Sellers (independent/Instagram sellers, onboarded manually)
create table sellers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  instagram_handle text,
  storefront_bio text,
  aesthetic_tags text[] default '{}',
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- Products (from affiliate feeds OR small sellers)
create table products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers(id) on delete set null,
  title text not null,
  description text,
  price numeric(10,2) not null,
  images text[] default '{}',
  source_platform text not null,       -- 'myntra' | 'nykaa' | 'instagram' | etc
  affiliate_link text,
  aesthetic_tags text[] default '{}',
  category text,                        -- 'fashion' | 'beauty'
  created_at timestamptz default now()
);

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  aesthetic_preferences text[] default '{}',
  created_at timestamptz default now()
);

-- Swipes (save/skip signals — feeds both closet + recommendations)
create table swipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  action text check (action in ('save', 'skip')) not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- Indexes for common queries
create index idx_products_aesthetic_tags on products using gin (aesthetic_tags);
create index idx_products_category on products (category);
create index idx_swipes_user_action on swipes (user_id, action);

-- ============================================
-- Row Level Security
-- ============================================
alter table profiles enable row level security;
alter table swipes enable row level security;
alter table products enable row level security;
alter table sellers enable row level security;

-- Profiles: users manage their own
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Swipes: users manage their own
create policy "Users can view own swipes" on swipes
  for select using (auth.uid() = user_id);
create policy "Users can insert own swipes" on swipes
  for insert with check (auth.uid() = user_id);

-- Products & sellers: publicly readable (it's a discovery feed)
create policy "Products are publicly readable" on products
  for select using (true);
create policy "Sellers are publicly readable" on sellers
  for select using (true);