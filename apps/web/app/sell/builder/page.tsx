"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getCurrentUser,
  getMySeller,
  getSellerProducts,
  updateSellerLayout,
  updateSellerTheme,
  type Seller,
  type SellerBlock,
  type SellerTheme,
} from "@iraya/supabase-client"
import { BlockRenderer, BLOCK_PALETTE, type BlockRendererProduct } from "@repo/ui/storefront-blocks"

const FONT_OPTIONS: { value: SellerTheme["fontFamily"]; label: string }[] = [
  { value: "sans", label: "Sans-serif" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
]

function defaultContentFor(type: SellerBlock["type"]): SellerBlock {
  switch (type) {
    case "text":
      return { type: "text", content: "Write something here..." }
    case "banner":
      return { type: "banner", imageUrl: "" }
    case "gallery":
      return { type: "gallery", imageUrls: [] }
    case "button":
      return { type: "button", label: "Shop Now", url: "" }
    case "social-links":
      return { type: "social-links" }
    case "embed":
      return { type: "embed", url: "" }
    default:
      return { type } as SellerBlock
  }
}

export default function StorefrontBuilderPage() {
  const [seller, setSeller] = useState<Seller | null>(null)
  const [blocks, setBlocks] = useState<SellerBlock[]>([])
  const [theme, setTheme] = useState<SellerTheme>({
    primaryColor: "#111111",
    backgroundColor: "#ffffff",
    fontFamily: "sans",
  })
  const [products, setProducts] = useState<BlockRendererProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function load() {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: mySeller } = await getMySeller(user.id)
      if (!mounted) return

      if (!mySeller) {
        router.push("/sell")
        return
      }
      if (mySeller.tier !== "premium") {
        router.push("/sell/dashboard")
        return
      }

      setSeller(mySeller)
      setBlocks(mySeller.layout_blocks ?? [])
      setTheme(mySeller.theme ?? theme)

      const { data: sellerProducts } = await getSellerProducts(mySeller.id)
      if (mounted) setProducts(sellerProducts ?? [])

      setLoading(false)
    }

    load()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addBlock(type: SellerBlock["type"]) {
    setBlocks((prev) => [...prev, defaultContentFor(type)])
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index))
  }

  function updateBlock(index: number, updated: SellerBlock) {
    setBlocks((prev) => prev.map((b, i) => (i === index ? updated : b)))
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) return
    setBlocks((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(dropIndex, 0, moved)
      return next
    })
    setDragIndex(null)
  }

  async function handleSave() {
    if (!seller) return
    setSaving(true)
    await Promise.all([updateSellerLayout(seller.id, blocks), updateSellerTheme(seller.id, theme)])
    setSaving(false)
  }

  if (loading || !seller) {
    return <div style={{ padding: "2rem" }}>Loading...</div>
  }

  const previewFont =
    theme.fontFamily === "serif" ? "Georgia, serif" : theme.fontFamily === "mono" ? "monospace" : "system-ui, sans-serif"

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem", flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 340px", maxWidth: 420 }}>
        <h1>Storefront Builder</h1>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          Drag blocks to reorder. Live at <code>/store/{seller.id}</code>.
        </p>

        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Theme</p>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: "0.85rem" }}>
              Primary{" "}
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => setTheme((t) => ({ ...t, primaryColor: e.target.value }))}
              />
            </label>
            <label style={{ fontSize: "0.85rem" }}>
              Background{" "}
              <input
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => setTheme((t) => ({ ...t, backgroundColor: e.target.value }))}
              />
            </label>
            <select
              value={theme.fontFamily}
              onChange={(e) => setTheme((t) => ({ ...t, fontFamily: e.target.value as SellerTheme["fontFamily"] }))}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Add a block</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {BLOCK_PALETTE.map((b) => (
              <button key={b.type} onClick={() => addBlock(b.type)} style={{ fontSize: "0.8rem", padding: "0.35rem 0.7rem" }}>
                + {b.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Blocks ({blocks.length})</p>
          {blocks.map((block, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: "0.6rem",
                marginBottom: "0.5rem",
                background: dragIndex === i ? "#f0f0f0" : "#fff",
                cursor: "grab",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                  ⠿ {BLOCK_PALETTE.find((p) => p.type === block.type)?.label ?? block.type}
                </span>
                <button
                  onClick={() => removeBlock(i)}
                  style={{ fontSize: "0.75rem", color: "#c00", background: "none", border: "none", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>

              {block.type === "text" && (
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(i, { type: "text", content: e.target.value })}
                  style={{ width: "100%", marginTop: "0.4rem", fontSize: "0.85rem" }}
                  rows={2}
                />
              )}
              {block.type === "banner" && (
                <input
                  placeholder="Image URL"
                  value={block.imageUrl}
                  onChange={(e) => updateBlock(i, { type: "banner", imageUrl: e.target.value })}
                  style={{ width: "100%", marginTop: "0.4rem", fontSize: "0.85rem" }}
                />
              )}
              {block.type === "button" && (
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem" }}>
                  <input
                    placeholder="Label"
                    value={block.label}
                    onChange={(e) => updateBlock(i, { ...block, label: e.target.value })}
                    style={{ flex: 1, fontSize: "0.85rem" }}
                  />
                  <input
                    placeholder="Link URL"
                    value={block.url}
                    onChange={(e) => updateBlock(i, { ...block, url: e.target.value })}
                    style={{ flex: 1, fontSize: "0.85rem" }}
                  />
                </div>
              )}
              {block.type === "embed" && (
                <input
                  placeholder="Video/embed URL"
                  value={block.url}
                  onChange={(e) => updateBlock(i, { type: "embed", url: e.target.value })}
                  style={{ width: "100%", marginTop: "0.4rem", fontSize: "0.85rem" }}
                />
              )}
              {block.type === "social-links" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginTop: "0.4rem" }}>
                  <input
                    placeholder="Instagram URL"
                    value={block.instagram ?? ""}
                    onChange={(e) => updateBlock(i, { ...block, instagram: e.target.value })}
                    style={{ fontSize: "0.85rem" }}
                  />
                  <input
                    placeholder="WhatsApp link"
                    value={block.whatsapp ?? ""}
                    onChange={(e) => updateBlock(i, { ...block, whatsapp: e.target.value })}
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              )}
              {block.type === "gallery" && (
                <input
                  placeholder="Image URLs, comma-separated"
                  value={block.imageUrls.join(", ")}
                  onChange={(e) =>
                    updateBlock(i, {
                      type: "gallery",
                      imageUrls: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  style={{ width: "100%", marginTop: "0.4rem", fontSize: "0.85rem" }}
                />
              )}
            </div>
          ))}
        </div>

        <button onClick={handleSave} disabled={saving} style={{ marginTop: "1rem", padding: "0.7rem 1.5rem", fontWeight: 600 }}>
          {saving ? "Saving..." : "Save storefront"}
        </button>
      </div>

      <div style={{ flex: "1 1 340px" }}>
        <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "0.75rem" }}>Live preview</p>
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 16,
            padding: "1.5rem",
            backgroundColor: theme.backgroundColor,
            fontFamily: previewFont,
          }}
        >
          <BlockRenderer
            blocks={blocks}
            seller={{
              name: seller.name,
              instagramHandle: seller.instagram_handle,
              storefrontBio: seller.storefront_bio,
              aestheticTags: seller.aesthetic_tags,
            }}
            products={products}
            theme={theme}
          />
        </div>
      </div>
    </div>
  )
}