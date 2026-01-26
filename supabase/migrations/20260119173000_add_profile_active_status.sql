-- Migration to add is_active status to profiles
-- This allows "soft delete" or deactivation of users in the admin panel

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing profiles to be active by default if they are null
UPDATE public.profiles 
SET is_active = true 
WHERE is_active IS NULL;
