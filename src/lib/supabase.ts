import { createClient } from '@supabase/supabase-js'

const VITE_SUPABASE_URL="https://inuqpzorjwciumiondbu.supabase.co"
const VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludXFwem9yandjaXVtaW9uZGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MDgwOTUsImV4cCI6MjA3MDQ4NDA5NX0.1wk8nT0t8bTsSRm8ZAvDyrl8pkwRVdKFUIt1bmszw18"
const supabaseUrl =  VITE_SUPABASE_URL//import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = VITE_SUPABASE_ANON_KEY//import.meta.env.VITE_SUPABASE_ANON_KEY
// const supabaseUrl =  import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface LeaderboardEntry {
  id: string
  username: string
  email: string // kept for DB compatibility; not collected from users
  score: number
  total_time: number
  best_combo: number
  created_at: string
}

export interface LeaderboardSubmission {
  username: string
  email: string // virtual placeholder email; UI collects only username
  score: number
  total_time: number
  best_combo: number
} 