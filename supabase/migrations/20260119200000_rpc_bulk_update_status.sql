-- Optimised Bulk Update RPC
-- Allows updating status for multiple users in a single transaction
-- array_ids: list of user UUIDs
-- new_status: boolean (true/false)

CREATE OR REPLACE FUNCTION public.bulk_update_user_status(
    p_user_ids UUID[],
    p_new_status BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Check Permissions (Admin Only)
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    -- 2. Bulk Update
    UPDATE public.profiles
    SET is_active = p_new_status
    WHERE id = ANY(p_user_ids);

END;
$$;
