"use client"

import { useEffect, useState } from "react"
import { supabase, getCurrentUser } from "@iraya/supabase-client"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user && mounted) {
        router.push("/login")
      }
    })

    async function loadProfile() {
      const user = await getCurrentUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (!mounted) return

      setProfile(data)
      setLoading(false)
    }

    loadProfile()

    return () => {
      mounted = false
      subscription?.unsubscribe?.()
    }
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Profile</h1>
      <p>Username: {profile?.username ?? "Not set"}</p>
      <p>Aesthetic preferences: {profile?.aesthetic_preferences?.join(", ") || "None yet"}</p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  )
}
