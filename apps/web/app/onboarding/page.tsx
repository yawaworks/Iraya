"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getProfile, updateAestheticPreferences, AESTHETIC_TAGS } from "@iraya/supabase-client"

export default function OnboardingPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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

      const { data } = await getProfile(user.id)
      if (!mounted) return

      setSelected(data?.aesthetic_preferences ?? [])
      setLoading(false)
    }

    load()
    return () => {
      mounted = false
    }
  }, [router])

  function toggleTag(tagId: string) {
    setSelected((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]))
  }

  async function handleContinue() {
    if (!userId) return
    setSaving(true)
    setError(null)

    const { error } = await updateAestheticPreferences(userId, selected)

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.push("/discover")
  }

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
      <h1>Pick your vibe</h1>
      <p style={{ color: "#555" }}>Choose the aesthetics you're drawn to — you can change these anytime.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem", margin: "1.5rem 0" }}>
        {AESTHETIC_TAGS.map((tag) => {
          const isSelected = selected.includes(tag.id)
          return (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              style={{
                padding: "1rem",
                borderRadius: 10,
                border: isSelected ? "2px solid #111" : "1px solid #ccc",
                background: isSelected ? "#111" : "#fff",
                color: isSelected ? "#fff" : "#111",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tag.label}
            </button>
          )
        })}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => router.push("/discover")} style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}>
          Skip for now
        </button>
        <button onClick={handleContinue} disabled={saving} style={{ padding: "0.6rem 1.5rem" }}>
          {saving ? "Saving..." : `Continue (${selected.length})`}
        </button>
      </div>
    </div>
  )
}