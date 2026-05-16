CREATE Table if NOT exists rate_limit_configs (
    id SERIAL PRIMARY KEY,
    rule_type VARCHAR(50) NOT NULL,
    request_limit INTEGER NOT NULL,
    window_second INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT now(),
    update_at TIMESTAMP DEFAULT now()
)


DO $$ 

BEGIN
    IF NOT EXISTS (SELECT 1 FROM rate_limit_configs LIMIT 1) 
    THEN INSERT INTO rate_limit_configs (rule_type, request_limit, window_second)
    VALUES 
            ('user_id', 500, 3600), ('ip_address', 20, 60);
            ('ip_address', 20, 60, 'Rate limit by IP address'),
            ('api_key', 1000, 3600, 'Rate limit by API key');
    END IF;
end $$

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='rate_limit_configs' AND column_name='description'
    ) THEN
        ALTER TABLE rate_limit_configs ADD COLUMN description TEXT;
    END IF;
END $$;