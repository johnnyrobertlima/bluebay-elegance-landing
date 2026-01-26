-- Migration: Automate Cost Center Cache Refresh
-- Date: 2026-01-21
-- Purpose: Schedule hourly updates for the commercial costs cache table.

-- 1. Enable pg_cron extension (Try to enable, might fail if not superuser/supported)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule the job
-- Unschedule first to avoid duplicates or errors on re-run
SELECT cron.unschedule('refresh_commercial_costs_hourly');

-- Runs every hour at minute 0 (0 * * * *)
-- Refreshes the current month's data.
SELECT cron.schedule(
    'refresh_commercial_costs_hourly', -- Job Name
    '0 * * * *',                       -- Schedule (Hourly)
    $$
    SELECT public.populate_commercial_costs_range(
        date_trunc('month', now()::timestamp), 
        (date_trunc('month', now()::timestamp) + interval '1 month' - interval '1 second')::timestamp
    );
    $$
);

-- Note: To check if it's running: SELECT * FROM cron.job;
