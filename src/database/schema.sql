BEGIN;

-- 1. Setup Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Tables with proper constraints
CREATE TABLE IF NOT EXISTS rate_limit_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    bucket_capacity INTEGER NOT NULL,
    refill_rate INTEGER NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS client_api_keys (
    api_key UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(100) NOT NULL,
    rule_id INTEGER REFERENCES rate_limit_rules(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Verification using a DO block
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_client_rule_id') THEN
        CREATE INDEX idx_client_rule_id ON client_api_keys(rule_id); -- Optimized to rule_id
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_active_client') THEN
        CREATE INDEX idx_active_client ON client_api_keys(api_key) WHERE is_active = true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_client_lookup') THEN
        CREATE INDEX idx_client_lookup ON client_api_keys(client_name, api_key);
    END IF;
END $$;

COMMIT;
