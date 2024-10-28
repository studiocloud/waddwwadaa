-- Create validation_history table
CREATE TABLE IF NOT EXISTS validation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing',
    total_emails INTEGER DEFAULT 0,
    valid_emails INTEGER DEFAULT 0,
    invalid_emails INTEGER DEFAULT 0,
    result_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_validation_history_user_id ON validation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_validation_history_created_at ON validation_history(created_at);

-- Add RLS policies
ALTER TABLE validation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own validation history"
    ON validation_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own validation history"
    ON validation_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own validation history"
    ON validation_history FOR UPDATE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_validation_history_updated_at
    BEFORE UPDATE ON validation_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();