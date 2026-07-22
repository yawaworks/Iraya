"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { SwipeCard, type SwipeCardHandle } from "@repo/ui/swipe-card"
import {
  getCurrentUser,
  supabase,
  getDiscoveryFeed,
  recordSwipe,
  type Product,
} from "@iraya/supabase-client"

export default function DiscoverPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const cardRefs = useRef<Record<string, SwipeCardHandle>>({})

  useEffect(() => {
    let mounted = true

    async function load() {
      const user = await getCurrentUser()
      if (!mounted) return

      if (!user) {
        router.push("/login")
        return
      }

      setUserId(user.id)

      const { data: profile } = await supabase
        .from("profiles")
        .select("aesthetic_preferences")
        .eq("id", user.id)
        .single()

      const { data, error } = await getDiscoveryFeed(user.id, profile?.aesthetic_preferences ?? [])
      if (!mounted) return

      if (error) console.error("Failed to load discovery feed:", error.message)

      setProducts(data ?? [])
      setLoading(false)
    }

    load()
    return () => {
      mounted = false
    }
  }, [router])

  async function handleSwipe(direction: string, product: Product) {
    if (!userId || (direction !== "left" && direction !== "right")) return

    const action = direction === "right" ? "save" : "skip"
    const { error } = await recordSwipe(userId, product.id, action)
    if (error) console.error("Failed to record swipe:", error.message)
  }

  function handleCardLeftScreen(productId: string) {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
    delete cardRefs.current[productId]
  }

  function triggerSwipe(direction: "left" | "right") {
    const top = products[products.length - 1]
    if (top) cardRefs.current[top.id]?.swipe(direction)
  }

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>
  }

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1>Discover</h1>

      <div style={{ position: "relative", width: 320, height: 460 }}>
        {products.length === 0 && (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            No more products right now — check back later!
          </p>
        )}

        {products.map((product) => (
          <SwipeCard
            key={product.id}
            ref={(el) => {
              if (el) cardRefs.current[product.id] = el
            }}
            onSwipe={(dir) => handleSwipe(dir, product)}
            onCardLeftScreen={() => handleCardLeftScreen(product.id)}
            preventSwipe={["up", "down"]}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 320,
                height: 460,
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                background: "#fff",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  flex: 1,
                  backgroundImage: product.images?.[0] ? `url(${product.images[0]})` : undefined,
                  backgroundColor: "#eee",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div style={{ padding: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{product.title}</h2>
                <p style={{ margin: "0.25rem 0", color: "#555" }}>Rs. {product.price}</p>
                {product.aesthetic_tags?.length > 0 && (
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>
                    {product.aesthetic_tags.join(" · ")}
                  </p>
                )}
              </div>
            </div>
          </SwipeCard>
        ))}
      </div>

      {products.length > 0 && (
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <button onClick={() => triggerSwipe("left")} style={{ padding: "0.6rem 1.2rem" }}>
            ✕ Skip
          </button>
          <button onClick={() => triggerSwipe("right")} style={{ padding: "0.6rem 1.2rem" }}>
            ♥ Save
          </button>
        </div>
      )}

      <p style={{ marginTop: "1rem", color: "#888", fontSize: "0.85rem" }}>
        Swipe right to save, left to skip
      </p>
    </div>
  )
}