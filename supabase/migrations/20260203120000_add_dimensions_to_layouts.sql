-- Add width and height columns to label layouts table
ALTER TABLE public.bluebay_label_layouts 
ADD COLUMN IF NOT EXISTS width INTEGER NOT NULL DEFAULT 86,
ADD COLUMN IF NOT EXISTS height INTEGER NOT NULL DEFAULT 120;

-- Comment on columns
COMMENT ON COLUMN public.bluebay_label_layouts.width IS 'Label width in millimeters';
COMMENT ON COLUMN public.bluebay_label_layouts.height IS 'Label height in millimeters';
