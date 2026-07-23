export type SellerBlock =
  | { type: "header" }
  | { type: "bio" }
  | { type: "tags" }
  | { type: "products" }
  | { type: "text"; content: string }
  | { type: "banner"; imageUrl: string }
  | { type: "gallery"; imageUrls: string[] }
  | { type: "button"; label: string; url: string }
  | { type: "social-links"; instagram?: string; whatsapp?: string; email?: string }
  | { type: "embed"; url: string }
  | { type: "divider" }
  | { type: "spacer" }

export type SellerTheme = {
  primaryColor: string
  backgroundColor: string
  fontFamily: "sans" | "serif" | "mono"
}

export type Seller = {
  id: string
  owner_id: string | null
  name: string
  instagram_handle: string | null
  storefront_bio: string | null
  aesthetic_tags: string[]
  is_verified: boolean
  tier: "free" | "premium"
  layout_blocks: SellerBlock[]
  theme: SellerTheme
  created_at: string
}

export type Product = {
  id: string
  seller_id: string | null
  title: string
  description: string | null
  price: number
  images: string[]
  source_platform: string
  affiliate_link: string | null
  external_id: string | null
  aesthetic_tags: string[]
  category: string | null
  created_at: string
}

export type Profile = {
  id: string
  username: string | null
  aesthetic_preferences: string[]
  created_at: string
}

export type Swipe = {
  id: string
  user_id: string
  product_id: string
  action: "save" | "skip"
  created_at: string
}