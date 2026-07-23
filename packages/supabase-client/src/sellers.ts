import { supabase } from "./client"
import type { SellerBlock } from "./types"
import type { SellerTheme } from "./types"

export async function updateSellerTheme(sellerId: string, theme: SellerTheme) {
  return supabase.from("sellers").update({ theme }).eq("id", sellerId)
}

export async function getMySeller(userId: string) {
  return supabase.from("sellers").select("*").eq("owner_id", userId).maybeSingle()
}

export async function getSellerWithProducts(sellerId: string) {
  return supabase.from("sellers").select("*, products(*)").eq("id", sellerId).single()
}

export async function createSeller(
  userId: string,
  input: { name: string; instagramHandle?: string; storefrontBio?: string; aestheticTags: string[] }
) {
  return supabase
    .from("sellers")
    .insert({
      owner_id: userId,
      name: input.name,
      instagram_handle: input.instagramHandle || null,
      storefront_bio: input.storefrontBio || null,
      aesthetic_tags: input.aestheticTags,
    })
    .select()
    .single()
}

export async function updateSellerProfile(
  sellerId: string,
  updates: Partial<{
    name: string
    instagram_handle: string | null
    storefront_bio: string | null
    aesthetic_tags: string[]
  }>
) {
  return supabase.from("sellers").update(updates).eq("id", sellerId)
}

export async function updateSellerLayout(sellerId: string, blocks: SellerBlock[]) {
  return supabase.from("sellers").update({ layout_blocks: blocks }).eq("id", sellerId)
}

/**
 * Flips a seller to the premium tier. No payment collection wired up yet —
 * that's Phase 3 per the roadmap (needs Razorpay/Cashfree + legal counsel,
 * see Section 14 of the brainstorm doc). This just unlocks the builder UI
 * so the tiering/gating logic can be built and tested now. Swap the body
 * of this function for a real payment-gated flow later.
 */
export async function upgradeSellerToPremium(sellerId: string) {
  const defaultBlocks: SellerBlock[] = [
    { type: "header" },
    { type: "bio" },
    { type: "tags" },
    { type: "products" },
  ]

  return supabase.from("sellers").update({ tier: "premium", layout_blocks: defaultBlocks }).eq("id", sellerId)
}

export async function addSellerProduct(
  sellerId: string,
  input: { title: string; price: number; imageUrl: string; aestheticTags: string[] }
) {
  return supabase.from("products").insert({
    seller_id: sellerId,
    title: input.title,
    price: input.price,
    images: input.imageUrl ? [input.imageUrl] : [],
    source_platform: "seller",
    aesthetic_tags: input.aestheticTags,
    category: "fashion",
  })
}

export async function getSellerProducts(sellerId: string) {
  return supabase.from("products").select("*").eq("seller_id", sellerId).order("created_at", { ascending: false })
}