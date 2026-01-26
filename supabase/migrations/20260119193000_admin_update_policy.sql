-- Ensure Admins can UPDATE profiles (needed for deactivation)

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Admins can update users profiles'
    ) THEN
        CREATE POLICY "Admins can update users profiles" 
        ON public.profiles 
        FOR UPDATE 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;
