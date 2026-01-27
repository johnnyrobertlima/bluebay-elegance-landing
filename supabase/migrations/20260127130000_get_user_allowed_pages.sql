-- Function to get all auth metadata for a user in a single call
-- Path: 20260127130000_get_user_allowed_pages.sql

CREATE OR REPLACE FUNCTION public.get_user_auth_metadata(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin boolean := false;
    v_allowed_paths text[] := '{}';
    v_home_page text := '/';
    v_result json;
BEGIN
    -- 1. Check if user belongs to an Admin group OR has the 'admin' role in app_user_roles
    v_is_admin := EXISTS (
        SELECT 1 FROM bluebay_group_member gm
        JOIN bluebay_group g ON g.id = gm.group_id
        WHERE gm.user_id = p_user_id 
          AND (g.name ILIKE 'Admin%' OR g.name ILIKE 'Administrador%')
    ) OR EXISTS (
        SELECT 1 FROM app_user_roles
        WHERE user_id = p_user_id AND role = 'admin'
    );

    -- 2. Get the redirect path
    IF v_is_admin THEN
        v_home_page := '/client-area/bluebay_adm';
    ELSE
        SELECT g.redirect_after_login INTO v_home_page
        FROM bluebay_group g
        JOIN bluebay_group_member gm ON gm.group_id = g.id
        WHERE gm.user_id = p_user_id 
          AND g.redirect_after_login IS NOT NULL 
          AND g.redirect_after_login <> '/'
        ORDER BY g.name ASC
        LIMIT 1;
    END IF;

    -- Default if still null
    IF v_home_page IS NULL THEN
        v_home_page := '/';
    END IF;

    -- 3. Fetch Allowed Pages
    IF v_is_admin THEN
        -- Admins get all active paths
        SELECT array_agg(path) INTO v_allowed_paths
        FROM bluebay_system_page
        WHERE is_active = true;
    ELSE
        -- Others get subset + all their parents recursively
        WITH RECURSIVE allowed_ids AS (
            -- Base case: pages explicitly granted
            SELECT gpp.page_id, 1 as depth
            FROM bluebay_group_page_permission gpp
            JOIN bluebay_group_member gm ON gm.group_id = gpp.group_id
            WHERE gm.user_id = p_user_id
              AND gpp.can_view = true
            
            UNION
            
            -- Recursive step: find parents
            SELECT sp.parent_id, ai.depth + 1
            FROM bluebay_system_page sp
            JOIN allowed_ids ai ON sp.id = ai.page_id
            WHERE sp.parent_id IS NOT NULL
              AND ai.depth < 8 -- Safety depth limit
        )
        SELECT array_agg(DISTINCT sp.path) INTO v_allowed_paths
        FROM bluebay_system_page sp
        JOIN allowed_ids ai ON sp.id = ai.page_id
        WHERE sp.is_active = true;
    END IF;

    -- 4. Construct Result
    v_result := json_build_object(
        'is_admin', v_is_admin,
        'allowed_paths', COALESCE(v_allowed_paths, '{}'::text[]),
        'home_page', v_home_page
    );

    RETURN v_result;
EXCEPTION WHEN OTHERS THEN
    -- Safety fallback
    RETURN json_build_object(
        'is_admin', false,
        'allowed_paths', '{}'::text[],
        'home_page', '/'
    );
END;
$$;
