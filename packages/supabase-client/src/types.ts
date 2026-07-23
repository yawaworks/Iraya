export type Seller = {
  id: string
  name: string
  instagram_handle: string | null
  storefront_bio: string | null
  aesthetic_tags: string[]
  is_verified: boolean
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
