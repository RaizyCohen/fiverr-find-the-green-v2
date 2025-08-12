import { supabase, LeaderboardEntry, LeaderboardSubmission } from './supabase'

export const leaderboardService = {
  // Submit a new score to the leaderboard
  async submitScore(submission: LeaderboardSubmission): Promise<LeaderboardEntry | null> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .insert([submission])
        .select()
        .single()

      if (error) {
        console.error('Error submitting score:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error submitting score:', error)
      return null
    }
  },

  // Get top scores for the leaderboard
  async getTopScores(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching leaderboard:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return []
    }
  },

  // Optional: Fetch a user's best score by username (email no longer collected)
  async getUserBestScoreByUsername(username: string): Promise<LeaderboardEntry | null> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .ilike('username', username)
        .order('score', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching user score:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user score:', error)
      return null
    }
  }
} 