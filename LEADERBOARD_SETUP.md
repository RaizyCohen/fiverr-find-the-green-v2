# Leaderboard Setup Guide

## Supabase Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Create Database Table
Run this SQL in your Supabase SQL editor:

```sql
-- Create leaderboard table
CREATE TABLE leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_time INTEGER NOT NULL,
  best_combo INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
-- Optional: remove if not querying by email
-- CREATE INDEX idx_leaderboard_email ON leaderboard(email);
CREATE INDEX idx_leaderboard_created_at ON leaderboard(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
-- In production, you might want more restrictive policies
CREATE POLICY "Allow all operations" ON leaderboard FOR ALL USING (true);
```

### 3. Environment Variables
Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Features
- **Score Submission**: Players submit their scores with username only (email auto-filled internally)
- **Leaderboard Display**: Shows top 10 scores with rankings
- **Privacy**: Only usernames are displayed; email is not collected
- **Real-time**: Leaderboard updates automatically
- **Validation**: Email format and required fields validation

### 5. Database Schema
- `id`: Unique identifier (UUID)
- `username`: Player's display name (shown on leaderboard)
- `email`: Placeholder value for compatibility (not collected from players)
- `score`: Final game score
- `total_time`: Total time in milliseconds
- `best_combo`: Highest combo achieved
- `created_at`: Timestamp of submission

### 6. Security Notes
- Email is not collected from players
- Usernames are sanitized and limited to 20 characters
- No email validation is performed in the UI
- Consider adding rate limiting for production use 