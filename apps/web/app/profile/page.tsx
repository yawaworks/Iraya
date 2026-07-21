"use client"

import { useEffect, useRef, useState } from "react"
import { supabase, getCurrentUser } from "@iraya/supabase-client"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  // Guards against onAuthStateChange firing (possibly with a stale/null
  // session) before the initial getCurrentUser() check has resolved.
  const initialCheckDone = useRef(false)

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      const user = await getCurrentUser()

      if (!mounted) return

      if (!user) {
        initialCheckDone.current = true
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
      initialCheckDone.current = true
    }

    loadProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Ignore events until the initial check above has finished — otherwise
      // a stale/null session emitted during client restore can bounce us
      // straight back to /login right after a successful sign-in.
      if (!initialCheckDone.current) return

      if (!session?.user && mounted) {
        router.push("/login")
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
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