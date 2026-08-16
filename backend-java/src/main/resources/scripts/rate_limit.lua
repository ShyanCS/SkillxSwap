-- Token bucket, evaluated atomically inside Redis.
--
-- The whole read-modify-write has to be one script: as separate GET/SET calls,
-- two API replicas checking the same bucket at once would both read the same
-- token count and both allow the request, so the limit would quietly scale with
-- the number of replicas -- exactly the bug moving to Redis is meant to fix.
--
-- KEYS[1] bucket key
-- ARGV[1] capacity (tokens per refill period)
-- ARGV[2] refill period in milliseconds
-- returns {allowed (0|1), retryAfterSeconds}

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillMillis = tonumber(ARGV[2])

-- Redis' own clock, not the caller's: replicas have independently skewed
-- clocks, and a fast one could otherwise refill a bucket ahead of schedule.
local time = redis.call('TIME')
local now = (tonumber(time[1]) * 1000) + (tonumber(time[2]) / 1000)

local stored = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(stored[1])
local ts = tonumber(stored[2])

if tokens == nil or ts == nil then
  tokens = capacity
  ts = now
end

local elapsed = now - ts
if elapsed > 0 then
  tokens = math.min(capacity, tokens + (elapsed / refillMillis) * capacity)
  ts = now
end

local allowed = 0
local retryAfter = 0

if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
else
  local millisPerToken = refillMillis / capacity
  retryAfter = math.ceil(((1 - tokens) * millisPerToken) / 1000)
  if retryAfter < 1 then
    retryAfter = 1
  end
end

redis.call('HSET', key, 'tokens', tokens, 'ts', ts)
-- Expire idle buckets so abandoned client keys don't accumulate forever. Two
-- refill periods is safely past the point where the bucket would be full again,
-- so dropping it loses no information.
redis.call('PEXPIRE', key, math.ceil(refillMillis * 2))

return {allowed, retryAfter}
