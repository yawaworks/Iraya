alter table products add column if not exists external_id text;

create unique index if not exists idx_products_source_external
  on products (source_platform, external_id)
  where external_id is not null;