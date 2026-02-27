-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('upload', 'manual')),
    content TEXT NOT NULL, -- JSON string for manual profile, or text content for extracted resume
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for profile name
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);
