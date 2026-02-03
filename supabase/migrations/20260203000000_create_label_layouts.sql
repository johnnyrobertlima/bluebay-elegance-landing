-- Create table for storing label layouts
CREATE TABLE IF NOT EXISTS public.bluebay_label_layouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    layout_data JSONB NOT NULL DEFAULT '[]'::jsonb, -- Stores array of label elements
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bluebay_label_layouts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow authenticated users to view layouts" ON public.bluebay_label_layouts;
DROP POLICY IF EXISTS "Allow authenticated users to insert layouts" ON public.bluebay_label_layouts;
DROP POLICY IF EXISTS "Allow authenticated users to update layouts" ON public.bluebay_label_layouts;
DROP POLICY IF EXISTS "Allow authenticated users to delete layouts" ON public.bluebay_label_layouts;

-- Create policy to allow authenticated users to view all layouts
CREATE POLICY "Allow authenticated users to view layouts"
    ON public.bluebay_label_layouts
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert layouts
CREATE POLICY "Allow authenticated users to insert layouts"
    ON public.bluebay_label_layouts
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow authenticated users to update layouts
CREATE POLICY "Allow authenticated users to update layouts"
    ON public.bluebay_label_layouts
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy to allow authenticated users to delete layouts
CREATE POLICY "Allow authenticated users to delete layouts"
    ON public.bluebay_label_layouts
    FOR DELETE
    TO authenticated
    USING (true);

-- Grant permissions to authenticated users
GRANT ALL ON TABLE public.bluebay_label_layouts TO authenticated;

-- Function to ensure only one layout is active at a time (optional but good practice)
CREATE OR REPLACE FUNCTION public.maintain_single_active_layout()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE public.bluebay_label_layouts
        SET is_active = false
        WHERE id != NEW.id AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to prevent duplication error on re-run
DROP TRIGGER IF EXISTS trigger_maintain_single_active_layout ON public.bluebay_label_layouts;

CREATE TRIGGER trigger_maintain_single_active_layout
    BEFORE INSERT OR UPDATE OF is_active
    ON public.bluebay_label_layouts
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION public.maintain_single_active_layout();
