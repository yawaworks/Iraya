import { supabase } from "./client"

/**
 * Record a save/skip decision. Upserts on (user_id, product_id) so a
 * re-swipe (e.g. after a retry) doesn't create a duplicate row or error
 * against the unique constraint.
 */
export async function recordSwipe(userId: string, productId: string, action: "save" | "skip") {
  return supabase
    .from("swipes")
    .upsert({ user_id: userId, product_id: productId, action }, { onConflict: "user_id,product_id" })
}

/** Fetch the user's saved (right-swiped) products, joined with product data. */
export async function getSavedProducts(userId: string) {
  return supabase
    .from("swipes")
    .select("product_id, products(*)")
    .eq("user_id", userId)
    .eq("action", "save")
    .order("created_at", { ascending: false })
}