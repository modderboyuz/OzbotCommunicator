-- Create telegram_login_attempts table
CREATE TABLE IF NOT EXISTS telegram_login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    telegram_id BIGINT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_telegram_login_attempts_token ON telegram_login_attempts(token);
CREATE INDEX IF NOT EXISTS idx_telegram_login_attempts_telegram_id ON telegram_login_attempts(telegram_id);

-- Auto-delete expired attempts
CREATE OR REPLACE FUNCTION delete_expired_login_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM telegram_login_attempts WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically delete expired attempts
CREATE OR REPLACE FUNCTION trigger_delete_expired_login_attempts()
RETURNS trigger AS $$
BEGIN
    PERFORM delete_expired_login_attempts();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs every hour
CREATE OR REPLACE FUNCTION create_cleanup_trigger()
RETURNS void AS $$
BEGIN
    -- This would ideally be a cron job, but for now we'll clean up on inserts
    CREATE TRIGGER IF NOT EXISTS cleanup_expired_login_attempts
        AFTER INSERT ON telegram_login_attempts
        FOR EACH STATEMENT
        EXECUTE FUNCTION trigger_delete_expired_login_attempts();
END;
$$ LANGUAGE plpgsql;

SELECT create_cleanup_trigger();
