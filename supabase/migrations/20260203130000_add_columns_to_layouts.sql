-- Add num_columns to label layouts table with default 1
ALTER TABLE public.bluebay_label_layouts 
ADD COLUMN IF NOT EXISTS num_columns INTEGER NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.bluebay_label_layouts.num_columns IS 'Number of columns of labels on the page/roll';
