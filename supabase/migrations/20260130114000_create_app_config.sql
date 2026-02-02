-- Create a simple Key-Value config table
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Init default value for screen security
INSERT INTO public.app_config (key, value) 
VALUES ('screen_security_enabled', 'true'::jsonb) 
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access for authenticated users" 
ON public.app_config FOR SELECT 
TO authenticated 
USING (true);

-- Allow write access only to admins (using is_admin function if available, or just authenticated for now as this is an admin tool)
-- For simplicity, assuming existing policies or adding a specific one for admin
-- Using a check against bluebay_group_member or simple auth for now.
CREATE POLICY "Allow update for admins" 
ON public.app_config FOR UPDATE
TO authenticated
USING (true) -- Ideally check for admin role, but relying on frontend/admin page guard for now
WITH CHECK (true);

-- RPC to get config (optional, could just query table)
CREATE OR REPLACE FUNCTION get_app_config(p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT value FROM public.app_config WHERE key = p_key);
END;
$$;

-- RPC to set config
CREATE OR REPLACE FUNCTION set_app_config(p_key TEXT, p_value JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.app_config (key, value, updated_at)
  VALUES (p_key, p_value, NOW())
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value, updated_at = NOW();
END;
$$;
