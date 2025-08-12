-- Enable required extensions for scheduling HTTP requests
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Create or replace a cron job to invoke the weather-alerts function every 3 hours
-- First, try to unschedule if an existing job with the same name exists
select cron.unschedule('invoke-weather-alerts-every-3-hours')
where exists (
  select 1 from cron.job where jobname = 'invoke-weather-alerts-every-3-hours'
);

select cron.schedule(
  'invoke-weather-alerts-every-3-hours',
  '0 */3 * * *',
  $$
  select net.http_post(
    url := 'https://fmuicnlptuhrqzqjmnwr.supabase.co/functions/v1/weather-alerts',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);
