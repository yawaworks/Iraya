import { supabase } from "./client"

export async function getProfile(userId: string) {
  return supabase.from("profiles").select("*").eq("id", userId).single()
}

export async function updateAestheticPreferences(userId: string, tags: string[]) {
  return supabase.from("profiles").update({ aesthetic_preferences: tags }).eq("id", userId)
}