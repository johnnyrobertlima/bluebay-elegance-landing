-- Create bluebay_group table
CREATE TABLE public.bluebay_group (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    redirect_after_login text DEFAULT '/' NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for bluebay_group
ALTER TABLE public.bluebay_group ENABLE ROW LEVEL SECURITY;

-- Policies for bluebay_group (Admins only)
CREATE POLICY "Admins can view bluebay_group"
ON public.bluebay_group FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert bluebay_group"
ON public.bluebay_group FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bluebay_group"
ON public.bluebay_group FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bluebay_group"
ON public.bluebay_group FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create bluebay_group_member table
CREATE TABLE public.bluebay_group_member (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid REFERENCES public.bluebay_group(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- Enable RLS for bluebay_group_member
ALTER TABLE public.bluebay_group_member ENABLE ROW LEVEL SECURITY;

-- Policies for bluebay_group_member (Admins only)
CREATE POLICY "Admins can view bluebay_group_member"
ON public.bluebay_group_member FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert bluebay_group_member"
ON public.bluebay_group_member FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bluebay_group_member"
ON public.bluebay_group_member FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bluebay_group_member"
ON public.bluebay_group_member FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
