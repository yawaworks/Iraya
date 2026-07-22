"use client"

import { useState } from "react"
import { signIn, signUp, getProfile } from "@iraya/supabase-client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = isSignUp
        ? await signUp(email, password, username)
        : await signIn(email, password)

      if (result.error || !result.data?.session?.user) {
        setError(result.error?.message ?? "Unable to sign in. Please check your credentials.")
        return
      }

      const { data: profile } = await getProfile(result.data.session.user.id)

      if (!profile?.aesthetic_preferences?.length) {
        router.push("/onboarding")
      } else {
        router.push("/discover")
      }
    } catch (err) {
      // Catches anything that isn't a normal Supabase { error } response —
      // network failures, CORS issues, a misconfigured Supabase URL, etc.
      // Without this, an exception here leaves the button stuck on
      // "Loading..." forever with no visible feedback.
      console.error("Auth request failed:", err)
      setError(
        err instanceof Error
          ? `Request failed: ${err.message}`
          : "Something went wrong. Check your connection and try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 400, margin: "0 auto" }}>
      <h1>{isSignUp ? "Sign Up" : "Log In"}</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {isSignUp && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Log In"}
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}>
          {isSignUp ? "Already have an account? Log in" : "No account? Sign up"}
        </button>
      </p>
    </div>
  )
}