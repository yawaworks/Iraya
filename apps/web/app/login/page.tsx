"use client"

import { useState } from "react"
import { signIn, signUp } from "@iraya/supabase-client"
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

    const result = isSignUp
      ? await signUp(email, password, username)
      : await signIn(email, password)

    setLoading(false)

    if (result.error || !result.data?.session?.user) {
      setError(result.error?.message ?? "Unable to sign in. Please check your credentials.")
      return
    }

    router.push("/profile")
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
