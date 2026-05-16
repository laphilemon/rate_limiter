--  Token bucket Alogrithm Implementation 
--  KEYS[1] = rate limit key e.g., ratelimit:user_123 or ratelimit:192.168.1.1)
--  ARGV[1] = request_limit (maximum token in bucket)
--  ARGV[2] = window_second (time window in second)
--  ARGV[3] = window timestamp (unix timestamp)

--  Returns: {allowed: 0|1, remainig_token: number, reset_time: number}

local key = KEYS[1]
local limit = ARGV[1]
local window = ARGV[2]
local now = ARGV[3]

-- Get current bucket state
local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(bucket[1]) or limit
local last_refill = tonumber(bucket[2]) or now

--Calculate tokens to add based on time passed
local time_passed = now - last_refill
local new_tokens = math.floor(time_passed *(limit/window))
tokens =  math.min(limit, tokens + new_tokens)

-- Check if request can allowed
local allowed = 0
if tokens >= 1 then
    tokens = tokens -1
    allowed = 1
end

-- Update bucket state
redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
-- Set Expiration to cleanup unused keys (2x window for safety)
redis.call('EXPIRE', key, window*2)

-- Calculate reset time (when bucket will be full again)
local token_needed = limit - tokens
local reset_time = now + math.floor(token_needed *(window/limit))


return {allowed, tokens, now + window}