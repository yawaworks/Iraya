import type { SellerBlock, SellerTheme } from "@iraya/supabase-client"

export interface BlockRendererProduct {
  id: string
  title: string
  price: number
  images: string[]
}

export interface BlockRendererProps {
  blocks: SellerBlock[]
  seller: {
    name: string
    instagramHandle: string | null
    storefrontBio: string | null
    aestheticTags: string[]
  }
  products: BlockRendererProduct[]
  theme?: SellerTheme
}

export const BLOCK_PALETTE: { type: SellerBlock["type"]; label: string }[] = [
  { type: "header", label: "Header (name + handle)" },
  { type: "bio", label: "Bio text" },
  { type: "tags", label: "Aesthetic tags" },
  { type: "products", label: "Product grid" },
  { type: "text", label: "Custom text" },
  { type: "banner", label: "Image banner" },
  { type: "gallery", label: "Image gallery" },
  { type: "button", label: "Button / CTA" },
  { type: "social-links", label: "Social links" },
  { type: "embed", label: "Video embed" },
  { type: "divider", label: "Divider" },
  { type: "spacer", label: "Spacer" },
]

export function BlockRenderer({ blocks, seller, products, theme }: BlockRendererProps) {
  const primary = theme?.primaryColor ?? "#111111"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {blocks.map((block, i) => (
        <div key={i}>{renderBlock(block, seller, products, primary)}</div>
      ))}
    </div>
  )
}

function renderBlock(
  block: SellerBlock,
  seller: BlockRendererProps["seller"],
  products: BlockRendererProduct[],
  primary: string
) {
  switch (block.type) {
    case "header":
      return (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: primary,
              color: "#fff",
              margin: "0 auto 0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "1.3rem",
            }}
          >
            {seller.name.charAt(0).toUpperCase() || "?"}
          </div>
          <h1 style={{ margin: 0, fontSize: "1.3rem" }}>{seller.name}</h1>
          {seller.instagramHandle && (
            <p style={{ margin: "0.2rem 0 0", color: "#666", fontSize: "0.9rem" }}>
              @{seller.instagramHandle.replace(/^@/, "")}
            </p>
          )}
        </div>
      )

    case "bio":
      return seller.storefrontBio ? (
        <p style={{ textAlign: "center", color: "#444", margin: 0 }}>{seller.storefrontBio}</p>
      ) : null

    case "tags":
      return seller.aestheticTags.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", justifyContent: "center" }}>
          {seller.aestheticTags.map((tag) => (
            <span
              key={tag}
              style={{ background: "#f3f3f3", borderRadius: 999, padding: "0.3rem 0.8rem", fontSize: "0.75rem" }}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null

    case "products":
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
          {products.length === 0 && (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#999" }}>No products yet</p>
          )}
          {products.map((product) => (
            <div key={product.id} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #eee" }}>
              <div
                style={{
                  aspectRatio: "3 / 4",
                  backgroundImage: product.images?.[0] ? `url(${product.images[0]})` : undefined,
                  backgroundColor: "#eee",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div style={{ padding: "0.5rem" }}>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>{product.title}</p>
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.8rem", color: "#666" }}>Rs. {product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )

    case "text":
      return <p style={{ margin: 0, color: "#333" }}>{block.content}</p>

    case "banner":
      return block.imageUrl ? (
        <img src={block.imageUrl} alt="" style={{ width: "100%", borderRadius: 12, display: "block" }} />
      ) : null

    case "gallery":
      return block.imageUrls.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem" }}>
          {block.imageUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8 }}
            />
          ))}
        </div>
      ) : null

    case "button":
      return block.url ? (
        
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            background: primary,
            color: "#fff",
            padding: "0.75rem",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          {block.label || "Click here"}
        </a>
      ) : null

    case "social-links":
      return (
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", fontSize: "0.85rem" }}>
          {block.instagram && (
            <a href={block.instagram} target="_blank" rel="noopener noreferrer" style={{ color: primary }}>
              Instagram
            </a>
          )}
          {block.whatsapp && (
            <a href={block.whatsapp} target="_blank" rel="noopener noreferrer" style={{ color: primary }}>
              WhatsApp
            </a>
          )}
          {block.email && (
            <a href={`mailto:${block.email}`} style={{ color: primary }}>
              Email
            </a>
          )}
        </div>
      )

    case "embed":
      return block.url ? (
        <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden" }}>
          <iframe
            src={block.url}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
            allowFullScreen
          />
        </div>
      ) : null

    case "divider":
      return <hr style={{ border: "none", borderTop: "1px solid #eee" }} />

    case "spacer":
      return <div style={{ height: "1.5rem" }} />

    default:
      return null
  }
}