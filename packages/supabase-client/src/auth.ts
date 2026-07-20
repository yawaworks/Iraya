import { supabase } from "./client"

export async function signUp(email: string, password: string, username: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession()
  return data?.session?.user ?? null
}
