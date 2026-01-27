-- Migration to add critical indexes for performance
-- Path: 20260127140000_optimize_auth_indexes.sql

-- For bluebay_group_member
CREATE INDEX IF NOT EXISTS idx_bluebay_group_member_user_id ON public.bluebay_group_member(user_id);

-- For bluebay_group_page_permission
CREATE INDEX IF NOT EXISTS idx_bluebay_group_page_permission_group_id ON public.bluebay_group_page_permission(group_id);
CREATE INDEX IF NOT EXISTS idx_bluebay_group_page_permission_page_id ON public.bluebay_group_page_permission(page_id);

-- For bluebay_system_page
CREATE INDEX IF NOT EXISTS idx_bluebay_system_page_parent_id ON public.bluebay_system_page(parent_id);
CREATE INDEX IF NOT EXISTS idx_bluebay_system_page_path ON public.bluebay_system_page(path);
