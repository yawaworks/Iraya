import { notFound } from "next/navigation"
import { getSellerWithProducts } from "@iraya/supabase-client"
import { BlockRenderer } from "@repo/ui/storefront-blocks"

export default async function PublicStorefrontPage({ params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await params
  const { data: seller, error } = await getSellerWithProducts(sellerId)

  if (error || !seller) notFound()

  const font =
    seller.theme?.fontFamily === "serif"
      ? "Georgia, serif"
      : seller.theme?.fontFamily === "mono"
        ? "monospace"
        : "system-ui, sans-serif"

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: seller.theme?.backgroundColor ?? "#fff",
        fontFamily: font,
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <BlockRenderer
          blocks={seller.layout_blocks?.length ? seller.layout_blocks : [{ type: "header" }, { type: "bio" }, { type: "products" }]}
          seller={{
            name: seller.name,
            instagramHandle: seller.instagram_handle,
            storefrontBio: seller.storefront_bio,
            aestheticTags: seller.aesthetic_tags,
          }}
          products={seller.products ?? []}
          theme={seller.theme}
        />
      </div>
    </div>
  )
}