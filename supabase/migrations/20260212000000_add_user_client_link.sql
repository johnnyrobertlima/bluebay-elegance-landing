-- Add columns to link user to a specific client or category
-- This allows restricting "Clientes" group users to specific data

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS linked_client_type TEXT CHECK (linked_client_type IN ('CNPJ', 'CATEGORY', 'NONE')) DEFAULT 'NONE',
ADD COLUMN IF NOT EXISTS linked_client_value TEXT;

COMMENT ON COLUMN public.profiles.linked_client_type IS 'Type of restriction: CNPJ (specific client), CATEGORY (group of clients), or NONE (no restriction/admin)';
COMMENT ON COLUMN public.profiles.linked_client_value IS 'Value of the restriction: The specific CNPJ or Category Name';
