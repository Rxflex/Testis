-- ClickHouse initialization script
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS testis;

-- Use the database
USE testis;

-- Create events table for analytics data
CREATE TABLE IF NOT EXISTS events (
    timestamp DateTime64(3) DEFAULT now64(),
    user_api_key String,
    domain String,
    visitor_id String,
    session_id String,
    event_type LowCardinality(String),
    page_url String,
    referrer String,
    user_agent String,
    ip_address String,
    country_code LowCardinality(String),
    city String,
    predicted_age_bucket LowCardinality(String),
    income_score UInt8,
    interests Array(String),
    viewport_width UInt16,
    viewport_height UInt16,
    screen_width UInt16,
    screen_height UInt16,
    created_at DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_api_key, domain, timestamp)
SETTINGS index_granularity = 8192;

-- Create heatmaps table for mouse tracking data
CREATE TABLE IF NOT EXISTS heatmaps (
    timestamp DateTime64(3) DEFAULT now64(),
    user_api_key String,
    domain String,
    visitor_id String,
    session_id String,
    page_url String,
    x_coords Array(UInt16),
    y_coords Array(UInt16),
    viewport_w UInt16,
    viewport_h UInt16,
    interaction_type LowCardinality(String), -- 'click', 'move', 'scroll'
    created_at DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_api_key, domain, timestamp)
SETTINGS index_granularity = 8192;

-- Create page_views materialized view for quick analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS page_views_mv
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_api_key, domain, toDate(timestamp), page_url)
AS SELECT
    user_api_key,
    domain,
    page_url,
    toDate(timestamp) as date,
    timestamp,
    count() as views,
    uniq(visitor_id) as unique_visitors
FROM events
WHERE event_type = 'pageview'
GROUP BY user_api_key, domain, page_url, date, timestamp;

-- Create user sessions materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS user_sessions_mv
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_api_key, domain, toDate(timestamp))
AS SELECT
    user_api_key,
    domain,
    toDate(timestamp) as date,
    timestamp,
    uniq(session_id) as sessions,
    uniq(visitor_id) as unique_users,
    avg(income_score) as avg_income_score
FROM events
GROUP BY user_api_key, domain, date, timestamp;