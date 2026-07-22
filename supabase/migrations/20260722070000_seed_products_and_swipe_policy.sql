-- ============================================
-- Fix: swipes needs an UPDATE policy for upsert
-- (recordSwipe uses upsert on conflict, which
-- requires UPDATE permission, not just INSERT)
-- ============================================
create policy "Users can update own swipes" on swipes
  for update using (auth.uid() = user_id);

-- ============================================
-- Seed test products for the discovery feed
-- ============================================
insert into products (title, description, price, images, source_platform, affiliate_link, aesthetic_tags, category)
values
  ('Pleated Tennis Skirt', 'Cream pleated mini skirt with side pockets', 899.00,
   array['https://picsum.photos/seed/skirt1/400/600'], 'myntra', 'https://example.com/aff/1',
   array['coquette', 'clean girl'], 'fashion'),

  ('Oversized Cargo Pants', 'Khaki cargo pants with utility pockets', 1299.00,
   array['https://picsum.photos/seed/cargo1/400/600'], 'ajio', 'https://example.com/aff/2',
   array['streetwear', 'y2k'], 'fashion'),

  ('Ribbed Knit Cardigan', 'Fitted cream cardigan with pearl buttons', 1499.00,
   array['https://picsum.photos/seed/cardigan1/400/600'], 'savana', 'https://example.com/aff/3',
   array['old money', 'clean girl'], 'fashion'),

  ('Chunky Platform Sneakers', 'White leather platform sneakers', 2499.00,
   array['https://picsum.photos/seed/sneakers1/400/600'], 'newme', 'https://example.com/aff/4',
   array['streetwear', 'alt'], 'fashion'),

  ('Satin Slip Dress', 'Midi length slip dress with lace trim', 1799.00,
   array['https://picsum.photos/seed/dress1/400/600'], 'flipkart', 'https://example.com/aff/5',
   array['coquette', 'old money'], 'fashion'),

  ('Grunge Plaid Mini Skirt', 'Black and red plaid pleated mini', 799.00,
   array['https://picsum.photos/seed/plaid1/400/600'], 'instagram', null,
   array['alt', 'y2k'], 'fashion'),

  ('Glass Skin Serum', 'K-beauty hydrating serum with niacinamide', 649.00,
   array['https://picsum.photos/seed/serum1/400/600'], 'tira', 'https://example.com/aff/6',
   array['clean girl'], 'beauty'),

  ('Tinted Lip Oil', 'Sheer glossy tint, buildable colour', 399.00,
   array['https://picsum.photos/seed/lip1/400/600'], 'purplle', 'https://example.com/aff/7',
   array['coquette', 'clean girl'], 'beauty'),

  ('Cargo Trench Coat', 'Oversized khaki trench with belt', 3299.00,
   array['https://picsum.photos/seed/trench1/400/600'], 'myntra', 'https://example.com/aff/8',
   array['old money', 'streetwear'], 'fashion'),

  ('Chain Layered Necklace', 'Gold-tone layered chain set', 599.00,
   array['https://picsum.photos/seed/necklace1/400/600'], 'instagram', null,
   array['y2k', 'alt'], 'fashion');