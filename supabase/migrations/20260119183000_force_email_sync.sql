-- Force Sync Emails from auth.users to public.profiles
-- Run this if your user list still shows "E-mail não disponível"

-- 1. Force update all profiles with email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;
-- Removed the 'AND p.email IS NULL' check to ensure even partial syncs are fixed

-- 2. Verify the count of profiles without email (Optional - for debugging)
-- SELECT count(*) as users_without_email FROM public.profiles WHERE email IS NULL;
