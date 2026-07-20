import { supabase } from "./client"

export type ProductFilters = {
  aestheticTags?: string[]
  category?: "fashion" | "beauty"
  excludeProductIds?: string[]
  limit?: number
}

/**
 * Fetch products, optionally filtered by aesthetic tag overlap and/or category.
 * Uses the `idx_products_aesthetic_tags` GIN index via `.overlaps()`.
 */
export async function getProducts(filters: ProductFilters = {}) {
  const { aestheticTags, category, excludeProductIds, limit = 20 } = filters

  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (aestheticTags && aestheticTags.length > 0) {
    // Row matches if its aesthetic_tags array shares at least one tag with the filter
    query = query.overlaps("aesthetic_tags", aestheticTags)
  }

  if (category) {
    query = query.eq("category", category)
  }

  if (excludeProductIds && excludeProductIds.length > 0) {
    query = query.not("id", "in", `(${excludeProductIds.join(",")})`)
  }

  return query
}

/**
 * Discovery feed for the swipe UI: products matching the user's aesthetic
 * preferences, excluding anything they've already swiped (save or skip).
 */
export async function getDiscoveryFeed(userId: string, aestheticTags: string[], limit = 20) {
  const { data: swiped, error: swipedError } = await supabase
    .from("swipes")
    .select("product_id")
    .eq("user_id", userId)

  if (swipedError) {
    return { data: null, error: swipedError }
  }

  const excludeProductIds = (swiped ?? []).map((s) => s.product_id)

  return getProducts({ aestheticTags, excludeProductIds, limit })
}